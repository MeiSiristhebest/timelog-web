const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInviteEmail(input: string): {
  ok: true;
  value: string;
} | {
  ok: false;
  error: string;
} {
  const value = input.trim().toLowerCase();

  if (!value) {
    return {
      ok: false,
      error: "Invite email is required.",
    };
  }

  if (!EMAIL_PATTERN.test(value)) {
    return {
      ok: false,
      error: "Enter a valid email address.",
    };
  }

  return {
    ok: true,
    value,
  };
}
