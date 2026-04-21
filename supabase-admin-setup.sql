-- 任命管理员的SQL脚本
-- 在Supabase SQL Editor中运行

-- 1. 查看所有用户和他们的角色
SELECT
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  CASE
    WHEN p.role = 'family_owner' THEN '管理员'
    WHEN p.role = 'family_member' THEN '成员'
    ELSE '未设置'
  END as role_chinese
FROM profiles p
ORDER BY p.created_at DESC;

-- 2. 任命特定用户为管理员
-- 将'user-id-here'替换为实际的用户ID
UPDATE profiles
SET role = 'family_owner'
WHERE id = 'user-id-here';

-- 3. 通过邮箱任命管理员
-- 将'admin@example.com'替换为实际的管理员邮箱
UPDATE profiles
SET role = 'family_owner'
WHERE email = 'admin@example.com';

-- 4. 撤销管理员权限
UPDATE profiles
SET role = 'family_member'
WHERE role = 'family_owner' AND email != 'keep-admin@example.com';

-- 5. 查看管理员统计
SELECT
  role,
  COUNT(*) as count,
  CASE
    WHEN role = 'family_owner' THEN '管理员'
    WHEN role = 'family_member' THEN '成员'
    ELSE '未设置'
  END as role_description
FROM profiles
GROUP BY role
ORDER BY count DESC;