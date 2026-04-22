-- 手动同步Authentication用户到Profiles表
-- 在Supabase SQL Editor中运行

-- 1. 查看当前的profiles表状态
SELECT
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  CASE
    WHEN p.id IS NULL THEN 'ID缺失'
    WHEN p.user_id IS NULL THEN 'UserID缺失'
    WHEN p.role IS NULL THEN '角色缺失'
    ELSE '完整'
  END as status
FROM profiles p
ORDER BY p.created_at DESC;

-- 2. 为没有角色的profiles设置默认角色
UPDATE profiles
SET role = 'family_member'
WHERE role IS NULL OR role = '';

-- 3. 为第一个用户设置管理员角色（如果还没有管理员）
UPDATE profiles
SET role = 'family_owner'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
) AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'family_owner'
);

-- 4. 确保id和user_id字段一致
UPDATE profiles
SET user_id = id
WHERE user_id IS NULL OR user_id != id;

-- 5. 检查并修复任何数据不一致的问题
-- 如果你知道具体的用户ID，可以手动创建profile：
/*
INSERT INTO profiles (id, user_id, email, display_name, full_name, role)
VALUES (
  'your-auth-user-id',
  'your-auth-user-id',
  'user@example.com',
  'Display Name',
  'Full Name',
  'family_member'
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;
*/

-- 6. 验证修复结果
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as profiles_with_role,
  COUNT(CASE WHEN role = 'family_owner' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'family_member' THEN 1 END) as member_count
FROM profiles;