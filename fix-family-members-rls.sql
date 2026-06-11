-- 修复 family_members 表的 RLS 无限递归问题
-- 请在 Supabase SQL Editor 中运行此脚本

-- =================================================================
-- 1. 创建安全定义者（SECURITY DEFINER）函数，用于安全地获取用户的 family_id
-- =================================================================
CREATE OR REPLACE FUNCTION public.get_user_family_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id uuid;
BEGIN
  SELECT family_id INTO v_family_id
  FROM public.family_members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN v_family_id;
END;
$$;

-- 授予执行权限给已认证用户
GRANT EXECUTE ON FUNCTION public.get_user_family_id(uuid) TO authenticated;

-- =================================================================
-- 2. 清理旧的、可能导致无限递归的 RLS 策略
-- =================================================================
-- 启用 RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 自动删除 family_members 表上的所有现有策略，以便重新创建
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'family_members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.family_members', pol.policyname);
  END LOOP;
END $$;

-- =================================================================
-- 3. 重新创建安全、无递归的 RLS 策略
-- =================================================================

-- 策略 1：允许用户查看自己，或者查看同一家庭（family_id 相同）的其他成员，或者查看被邀请邮箱匹配的记录，或者查看自己发出的邀请
CREATE POLICY "family_members_select" ON public.family_members
  FOR SELECT
  TO authenticated
  USING (
    -- 场景 A：是用户自己的记录
    user_id = auth.uid()
    OR
    -- 场景 B：属于同一个家庭（使用安全定义者函数避免递归）
    family_id = public.get_user_family_id(auth.uid())
    OR
    -- 场景 C：邮箱匹配（用于接受邀请前的预览）
    email = auth.jwt()->>'email'
    OR
    -- 场景 D：是当前用户发出的邀请
    invited_by = auth.uid()
  );

-- 策略 2：允许已认证用户发起邀请（插入记录），只要 invited_by 是自己
CREATE POLICY "family_members_insert" ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
  );

-- 策略 3：允许管理员更新成员信息，或者受邀者自己更新状态（接受邀请）
CREATE POLICY "family_members_update" ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (
    -- 场景 A：当前用户是该家庭的管理员（在 profiles 表中角色为 family_owner）
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'family_owner'
    )
    OR
    -- 场景 B：受邀者自己更新自己的记录（例如接受邀请）
    email = auth.jwt()->>'email'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'family_owner'
    )
    OR
    email = auth.jwt()->>'email'
  );

-- 策略 4：允许管理员删除成员
CREATE POLICY "family_members_delete" ON public.family_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'family_owner'
    )
  );

-- =================================================================
-- 4. 验证新策略是否创建成功
-- =================================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'family_members' AND schemaname = 'public';
