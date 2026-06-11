"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("Devices");
  const tCommon = await getTranslations("Common");
  const deviceId = String(formData.get("deviceId") ?? "").trim();
  if (!deviceId) {
    return deviceError(t("errorDeviceIdMissing"));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return deviceError(tCommon("supabaseNotConfigured"));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return deviceError(tCommon("authRequired"));
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
    message: t("revokeSuccess"),
  };
}

export async function verifyDeviceCodeAction(
  _prevState: DeviceActionState,
  formData: FormData
): Promise<DeviceActionState> {
  const t = await getTranslations("Devices");
  const tCommon = await getTranslations("Common");
  const code = String(formData.get("code") ?? "").trim().replace(/-/g, "");
  if (!code || code.length !== 6) {
    return deviceError(t("errorInvalidCode"));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return deviceError(tCommon("supabaseNotConfigured"));
  }

  const { data, error } = await supabase.rpc("verify_device_code", {
    p_code: code,
  });

  if (error) {
    return deviceError(error.message);
  }

  const result = data as { ok: boolean; error?: string };
  if (!result.ok) {
    return deviceError(result.error || t("errorVerifyFailed"));
  }

  revalidatePath("/devices");
  revalidatePath("/overview");

  return {
    status: "success",
    message: t("linkSuccess"),
  };
}

export async function updateDeviceNameAction(
  deviceId: string,
  newName: string
): Promise<DeviceActionState> {
  const t = await getTranslations("Devices");
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return deviceError(tCommon("supabaseNotConfigured"));

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
    message: t("renameSuccessMsg"),
  };
}
