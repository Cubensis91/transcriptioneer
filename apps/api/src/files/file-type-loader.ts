// `file-type` is ESM-only; apps/api compiles to CommonJS, so it must be
// loaded via dynamic import() (works fine under real Node at runtime — this
// indirection exists purely so Jest, which can't follow a literal
// import("file-type") without --experimental-vm-modules, can mock this one
// small module instead).
export async function detectFileType(buffer: Buffer): Promise<{ mime: string } | undefined> {
  const { fileTypeFromBuffer } = await import("file-type");
  return fileTypeFromBuffer(buffer);
}
