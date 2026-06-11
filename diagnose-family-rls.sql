-- 诊断脚本：检查当前用户的 RLS 状态和数据
-- 请在 Supabase SQL Editor 中运行此脚本，并查看返回的结果

-- 1. 查看当前登录的 Auth 用户信息（在 SQL Editor 中通常是当前运行脚本的管理员或您自己）
SELECT 
  auth.uid() as current_auth_uid,
  auth.jwt()->>'email' as current_auth_email;

-- 2. 查看 profiles 表中当前用户的信息
SELECT id, user_id, email, display_name, role
FROM public.profiles
WHERE id = auth.uid() OR email = auth.jwt()->>'email';

-- 3. 查看 family_members 表中当前用户的所有相关记录
SELECT id, user_id, email, family_id, role, status, invited_by
FROM public.family_members
WHERE user_id = auth.uid() OR email = auth.jwt()->>'email';

-- 4. 测试 get_user_family_id 函数的返回值
SELECT 
  auth.uid() as test_uid,
  public.get_user_family_id(auth.uid()) as resolved_family_id;

-- 5. 检查整个 family_members 表的数据量和结构（帮助我们理解当前数据库状态）
SELECT COUNT(*) as total_members FROM public.family_members;
