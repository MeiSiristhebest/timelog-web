-- 更新Profiles表以匹配应用代码中的角色定义
-- 在Supabase SQL Editor中运行

-- 1. 更新role字段的检查约束
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('super_admin', 'family_owner', 'family_member', 'guest', 'storyteller', 'family'));

-- 2. 为所有现有的auth.users创建profiles记录
-- 这会为没有profiles记录的auth用户创建默认的family_member角色

INSERT INTO profiles (
  id,
  user_id,
  email,
  display_name,
  full_name,
  role,
  created_at
)
SELECT
  au.id,
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1), 'User'),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'display_name', 'User'),
  'family_member', -- 默认角色
  COALESCE(au.created_at, now())
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 3. 为第一个注册的用户设置管理员角色
UPDATE profiles
SET role = 'family_owner'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
);

-- 4. 验证结果
SELECT
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  CASE
    WHEN p.id = p.user_id THEN '✓ 匹配'
    ELSE '✗ 不匹配'
  END as id_consistency
FROM profiles p
ORDER BY p.created_at ASC;

-- 5. 检查总数
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM profiles WHERE role IS NOT NULL) as profiles_with_role;