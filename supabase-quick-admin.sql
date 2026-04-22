-- 快速任命管理员的SQL脚本
-- 在Supabase SQL Editor中运行

-- 方法1: 任命特定邮箱用户为管理员
UPDATE profiles
SET role = 'family_owner'
WHERE email = 'your-email@example.com';

-- 方法2: 查看当前所有用户
SELECT id, email, display_name, role, created_at
FROM profiles
ORDER BY created_at ASC;

-- 方法3: 任命最早注册的用户为管理员（如果还没有管理员）
UPDATE profiles
SET role = 'family_owner'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
);

-- 方法4: 检查管理员数量
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role;

-- 方法5: 重置所有人为成员（保留一个管理员）
UPDATE profiles
SET role = 'family_member'
WHERE role = 'family_owner'
  AND email NOT IN ('keep-admin@example.com');