"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { revokeDeviceAction, type DeviceActionState } from "../actions";

const initialState: DeviceActionState = {
  status: "idle",
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-danger/40 bg-danger/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-danger transition hover:border-danger hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Revoking..." : "Revoke"}
    </button>
  );
}

export function DeviceRevokeForm({ deviceId }: { deviceId: string }) {
  const [state, formAction] = useActionState(revokeDeviceAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="deviceId" value={deviceId} />
      <SubmitButton />
      <p
        className={`text-xs ${
          state.status === "error" ? "text-danger" : "text-muted"
        }`}
      >
        {state.message ?? "Revocation takes effect on the next device sync."}
      </p>
    </form>
  );
}
