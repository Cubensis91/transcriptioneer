import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";

function makeHost() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const response = { status };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe("HttpExceptionFilter", () => {
  const filter = new HttpExceptionFilter();

  it("formats a plain HttpException into the ApiResponse envelope", () => {
    const { host, status, json } = makeHost();
    filter.catch(new UnauthorizedException("Invalid email or password."), host);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UnauthorizedException", message: "Invalid email or password." },
    });
  });

  it("formats ConflictException the same way", () => {
    const { host, status, json } = makeHost();
    filter.catch(new ConflictException("An account with this email already exists."), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "ConflictException", message: "An account with this email already exists." },
    });
  });

  it("joins ZodValidationPipe's { message, issues } shape into one message", () => {
    const { host, status, json } = makeHost();
    filter.catch(
      new BadRequestException({
        message: "Validation failed",
        issues: [
          { path: "email", message: "Enter a valid email address." },
          { path: "password", message: "Password must be at least 8 characters." },
        ],
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "BadRequestException",
        message:
          "email: Enter a valid email address. password: Password must be at least 8 characters.",
      },
    });
  });

  it("never leaks a raw non-HTTP error's message to the client", () => {
    const { host, status, json } = makeHost();
    filter.catch(new Error("connect ECONNREFUSED 127.0.0.1:5432"), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "InternalServerError", message: "Internal server error." },
    });
  });
});
