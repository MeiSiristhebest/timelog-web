import { describe, expect, it } from "vitest";
import { validateInviteEmail } from "./action-state";

describe("family invite validation", () => {
  it("normalizes a valid invite email", () => {
    expect(validateInviteEmail("  Cousin.Li@Example.com ")).toEqual({
      ok: true,
      value: "cousin.li@example.com",
    });
  });

  it("rejects a blank invite email", () => {
    expect(validateInviteEmail("   ")).toEqual({
      ok: false,
      error: "Invite email is required.",
    });
  });

  it("rejects malformed invite email", () => {
    expect(validateInviteEmail("not-an-email")).toEqual({
      ok: false,
      error: "Enter a valid email address.",
    });
  });
});
