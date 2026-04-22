-- 简化角色系统：只保留必要的角色
-- 在Supabase SQL Editor中运行

-- 1. 将所有非常用角色转换为标准角色
UPDATE profiles
SET role = CASE
  WHEN role IN ('super_admin', 'storyteller', 'family') THEN 'family_owner'
  ELSE 'family_member'
END;

-- 2. 更新检查约束，只允许必要的角色
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('family_owner', 'family_member', 'guest'));

-- 3. 验证结果
SELECT
  role,
  COUNT(*) as count,
  CASE
    WHEN role = 'family_owner' THEN '👑 管理员'
    WHEN role = 'family_member' THEN '👤 成员'
    WHEN role = 'guest' THEN '👤 访客'
    ELSE '❓ 其他'
  END as description
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- 4. 查看管理员用户
SELECT
  email,
  display_name,
  role,
  created_at
FROM profiles
WHERE role = 'family_owner'
ORDER BY created_at ASC;