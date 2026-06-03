import { describe, expect, it } from "vitest";
import {
  isValidFormNationalPhone,
  nationalDigitsToE164,
  sanitizeNationalDigits,
} from "./phoneValidation";

describe("phoneValidation", () => {
  it("validates Jordan 9-digit national", () => {
    expect(isValidFormNationalPhone("JO", "791862528")).toBe(true);
  });

  it("validates Jordan 10-digit with leading zero", () => {
    expect(isValidFormNationalPhone("JO", "0791862528")).toBe(true);
  });

  it("builds E.164 for Jordan", () => {
    expect(nationalDigitsToE164("962", "791862528", "JO")).toBe("+962791862528");
  });

  it("sanitizes non-digits", () => {
    expect(sanitizeNationalDigits("07-918-62528", "JO")).toBe("0791862528");
  });
});
