-- Migration: Verify Device Code & Link Family
-- Date: 2026-04-08
-- Description: Atomically verifies a 6-digit device code and links the caller (family member) to the senior who generated the code.

CREATE OR REPLACE FUNCTION public.verify_device_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_senior_id UUID;
    v_code_id UUID;
BEGIN
    -- 1. Find the most recent valid code
    SELECT id, family_user_id INTO v_code_id, v_senior_id
    FROM public.device_codes
    WHERE code = p_code
      AND used_at IS NULL
      AND revoked_at IS NULL
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    -- 2. Validate
    IF v_code_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Invalid, expired, or already used code.');
    END IF;

    -- 3. Prevent self-pairing (Safety)
    IF v_senior_id = auth.uid() THEN
        RETURN jsonb_build_object('ok', false, 'error', 'You cannot link to yourself.');
    END IF;

    -- 4. Create family connection
    INSERT INTO public.family_connections (senior_id, member_id)
    VALUES (v_senior_id, auth.uid())
    ON CONFLICT (senior_id, member_id) DO NOTHING;

    -- 5. Mark code as used
    UPDATE public.device_codes
    SET used_at = now()
    WHERE id = v_code_id;

    -- 6. Record device reference if not exists (for auditing)
    INSERT INTO public.devices (family_user_id, device_name, last_seen_at)
    VALUES (auth.uid(), 'Linked via code: ' || p_code, now())
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object('ok', true, 'senior_id', v_senior_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_device_code(TEXT) TO authenticated;

COMMENT ON FUNCTION public.verify_device_code IS 'Atomically verifies a 6-digit pairing code and establishes a family connection.';
