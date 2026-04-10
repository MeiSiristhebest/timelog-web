"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DeviceActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

function deviceError(message: string): DeviceActionState {
  return {
    status: "error",
    message,
  };
}

export async function revokeDeviceAction(
  _prevState: DeviceActionState,
  formData: FormData
): Promise<DeviceActionState> {
  const deviceId = String(formData.get("deviceId") ?? "").trim();
  if (!deviceId) {
    return deviceError("Device identifier is missing.");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return deviceError("Supabase is not configured in this environment yet.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return deviceError("You need an active session before revoking devices.");
  }

  const { error } = await supabase.rpc("revoke_device", {
    p_device_id: deviceId,
  });

  if (error) {
    return deviceError(error.message);
  }

  revalidatePath("/devices");

  return {
    status: "success",
    message: "Device access revoked.",
  };
}

export async function verifyDeviceCodeAction(
  _prevState: DeviceActionState,
  formData: FormData
): Promise<DeviceActionState> {
  const code = String(formData.get("code") ?? "").trim().replace(/-/g, "");
  if (!code || code.length !== 6) {
    return deviceError("Please enter a valid 6-digit code.");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return deviceError("Supabase is not configured.");
  }

  const { data, error } = await supabase.rpc("verify_device_code", {
    p_code: code,
  });

  if (error) {
    return deviceError(error.message);
  }

  const result = data as { ok: boolean; error?: string };
  if (!result.ok) {
    return deviceError(result.error || "Failed to verify pairing code.");
  }

  revalidatePath("/devices");
  revalidatePath("/overview");

  return {
    status: "success",
    message: "Successfully linked to storyteller archive.",
  };
}

export async function updateDeviceNameAction(
  deviceId: string,
  newName: string
): Promise<DeviceActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return deviceError("Supabase not configured.");

  const { error } = await supabase
    .from("devices")
    .update({ name: newName })
    .eq("id", deviceId);

  if (error) {
    console.error("Error updating device name:", error);
    return deviceError(error.message);
  }

  revalidatePath("/devices");

  return {
    status: "success",
    message: "设备标识名称已更新",
  };
}
