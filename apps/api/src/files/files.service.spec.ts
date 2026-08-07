/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method --
   this file wires an untyped Jest mock of the Prisma client (the real client is fully
   typed), and passes jest.fn() mock methods to expect(...).toHaveBeenCalledWith(...),
   which the unbound-method rule can't distinguish from a real unbound method reference. */
jest.mock("@transcriptioneer/database", () => {
  const prisma: any = {
    sourceFile: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { prisma };
});

jest.mock("./file-type-loader", () => ({ detectFileType: jest.fn() }));

import { BadRequestException, NotFoundException } from "@nestjs/common";
import { prisma } from "@transcriptioneer/database";
import { detectFileType } from "./file-type-loader";
import { FilesService } from "./files.service";
import { StorageService } from "./storage.service";

type FakeSourceFile = {
  id: string;
  organizationId: string;
  uploadedById: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: "PENDING" | "UPLOADED" | "FAILED";
  createdAt: Date;
};

let files: FakeSourceFile[];
let idCounter: number;

function nextId(): string {
  idCounter += 1;
  return `file-${idCounter}`;
}

function wireMockPrisma(): void {
  const p = prisma as any;

  p.sourceFile.create.mockImplementation(({ data }: any) => {
    const file: FakeSourceFile = {
      id: nextId(),
      status: "PENDING",
      createdAt: new Date(),
      ...data,
    };
    files.push(file);
    return Promise.resolve(file);
  });
  p.sourceFile.findFirst.mockImplementation(({ where }: any) => {
    return Promise.resolve(
      files.find((f) => f.id === where.id && f.organizationId === where.organizationId) ?? null,
    );
  });
  p.sourceFile.findMany.mockImplementation(({ where }: any) => {
    return Promise.resolve(
      files
        .filter((f) => f.organizationId === where.organizationId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  });
  p.sourceFile.update.mockImplementation(({ where, data }: any) => {
    const file = files.find((f) => f.id === where.id);
    if (!file) throw new Error("file not found");
    Object.assign(file, data);
    return Promise.resolve(file);
  });
  p.sourceFile.delete.mockImplementation(({ where }: any) => {
    files = files.filter((f) => f.id !== where.id);
    return Promise.resolve(undefined);
  });
}

const AUTH_USER_A = {
  sub: "user-a",
  email: "a@example.com",
  organizationId: "org-a",
  role: "OWNER" as const,
};
const AUTH_USER_B = {
  sub: "user-b",
  email: "b@example.com",
  organizationId: "org-b",
  role: "OWNER" as const,
};

describe("FilesService", () => {
  let storage: jest.Mocked<StorageService>;
  let service: FilesService;

  beforeEach(() => {
    files = [];
    idCounter = 0;
    jest.clearAllMocks();
    wireMockPrisma();

    storage = {
      getPresignedUploadUrl: jest.fn().mockResolvedValue("https://storage.example/put"),
      getPresignedDownloadUrl: jest.fn().mockResolvedValue("https://storage.example/get"),
      headObject: jest.fn().mockResolvedValue({ sizeBytes: 1234 }),
      getObjectPrefix: jest.fn().mockResolvedValue(Buffer.from("fake bytes")),
      deleteObject: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<StorageService>;

    service = new FilesService(storage);
  });

  describe("presignUpload", () => {
    it("creates a PENDING SourceFile row and returns a presigned URL", async () => {
      const result = await service.presignUpload(AUTH_USER_A, {
        filename: "meeting.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 5000,
      });

      expect(result.file.status).toBe("PENDING");
      expect(result.file.originalName).toBe("meeting.mp3");
      expect(result.uploadUrl).toBe("https://storage.example/put");
      expect(files[0].organizationId).toBe("org-a");
      expect(files[0].storageKey).toContain("org-a/");
    });
  });

  describe("confirmUpload", () => {
    it("marks the file UPLOADED when the storage object matches the declared type", async () => {
      (detectFileType as jest.Mock).mockResolvedValue({ mime: "audio/mpeg", ext: "mp3" });
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "meeting.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 5000,
      });

      const confirmed = await service.confirmUpload(AUTH_USER_A, file.id);

      expect(confirmed.status).toBe("UPLOADED");
      expect(confirmed.sizeBytes).toBe(1234); // real size from storage.headObject
      expect(storage.deleteObject).not.toHaveBeenCalled();
    });

    it("rejects and deletes the object when the real bytes don't match the declared type", async () => {
      (detectFileType as jest.Mock).mockResolvedValue({
        mime: "application/x-msdownload",
        ext: "exe",
      });
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "totally-a-song.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 5000,
      });

      await expect(service.confirmUpload(AUTH_USER_A, file.id)).rejects.toThrow(
        BadRequestException,
      );

      expect(storage.deleteObject).toHaveBeenCalledWith(files[0].storageKey);
      expect(files[0].status).toBe("FAILED");
    });

    it("rejects when the object was never actually uploaded to storage", async () => {
      storage.headObject.mockResolvedValueOnce(null);
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "meeting.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 5000,
      });

      await expect(service.confirmUpload(AUTH_USER_A, file.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("trusts undetected magic bytes only for text/plain and text/markdown", async () => {
      (detectFileType as jest.Mock).mockResolvedValue(undefined);
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "notes.md",
        mimeType: "text/markdown",
        sizeBytes: 100,
      });

      const confirmed = await service.confirmUpload(AUTH_USER_A, file.id);
      expect(confirmed.status).toBe("UPLOADED");
    });
  });

  describe("cross-org scoping", () => {
    it("does not return another organization's file", async () => {
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "secret.pdf",
        mimeType: "application/pdf",
        sizeBytes: 5000,
      });

      await expect(service.getFile(AUTH_USER_B, file.id)).rejects.toThrow(NotFoundException);
      await expect(service.confirmUpload(AUTH_USER_B, file.id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteFile(AUTH_USER_B, file.id)).rejects.toThrow(NotFoundException);
    });

    it("does not include another organization's files in the list", async () => {
      await service.presignUpload(AUTH_USER_A, {
        filename: "a.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1,
      });
      await service.presignUpload(AUTH_USER_B, {
        filename: "b.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1,
      });

      const listA = await service.listFiles(AUTH_USER_A);
      expect(listA).toHaveLength(1);
      expect(listA[0].originalName).toBe("a.pdf");
    });
  });

  describe("deleteFile", () => {
    it("removes the storage object and the DB row", async () => {
      const { file } = await service.presignUpload(AUTH_USER_A, {
        filename: "meeting.mp3",
        mimeType: "audio/mpeg",
        sizeBytes: 5000,
      });

      await service.deleteFile(AUTH_USER_A, file.id);

      expect(storage.deleteObject).toHaveBeenCalled();
      expect(files).toHaveLength(0);
    });
  });
});
