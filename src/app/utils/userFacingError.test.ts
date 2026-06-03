import { describe, expect, it } from "vitest";
import {
  GENERIC_ERROR,
  getUserFacingErrorMessage,
  humanizeValidationMessage,
  sanitizeUserFacingMessage,
} from "./userFacingError";

describe("userFacingError", () => {
  it("humanizes Zod null errors", () => {
    expect(humanizeValidationMessage("phone: Expected string, received null")).toBe(
      "Phone number is required.",
    );
  });

  it("hides postgres internals", () => {
    expect(sanitizeUserFacingMessage('duplicate key value violates unique constraint "users_email_key"')).toBe(
      GENERIC_ERROR,
    );
  });

  it("hides jwt and token jargon", () => {
    expect(sanitizeUserFacingMessage("JWT expired")).toMatch(/session has expired/i);
    expect(sanitizeUserFacingMessage("Invalid token")).toMatch(/session has expired|incorrect or has expired/i);
  });

  it("maps OTP errors to verification copy", () => {
    expect(sanitizeUserFacingMessage("Invalid OTP")).toMatch(/code you entered/i);
  });

  it("preserves seat availability message", () => {
    expect(sanitizeUserFacingMessage("One or more selected seats are no longer available")).toMatch(
      /no longer available/i,
    );
  });

  it("uses fallback for unknown errors", () => {
    expect(getUserFacingErrorMessage(new Error("ECONNREFUSED postgres://"), "Custom fallback")).toBe(
      "Custom fallback",
    );
  });
});
