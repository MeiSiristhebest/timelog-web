-- 清理测试数据和设置正确的管理员
-- 在Supabase SQL Editor中运行

-- 1. 备份当前数据（可选）
-- CREATE TABLE profiles_backup_before_cleanup AS SELECT * FROM profiles;

-- 2. 删除没有邮箱的测试用户（这些可能是匿名注册或测试数据）
DELETE FROM profiles
WHERE email IS NULL OR email = '' OR display_name = 'User';

-- 3. 确保有至少一个管理员
-- 如果删除了管理员，设置最早的有邮箱用户为管理员
UPDATE profiles
SET role = 'family_owner'
WHERE id = (
  SELECT id FROM profiles
  WHERE email IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1
) AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'family_owner'
);

-- 4. 清理重复或无效的记录
-- 删除没有user_id的记录
DELETE FROM profiles WHERE user_id IS NULL;

-- 5. 验证清理结果
SELECT
  '清理后统计' as status,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL) as profiles_with_email,
  (SELECT COUNT(*) FROM profiles WHERE role = 'family_owner') as admin_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'family_member') as member_count;

-- 6. 查看剩余的有效用户
SELECT
  id,
  email,
  display_name,
  role,
  created_at,
  CASE
    WHEN role = 'family_owner' THEN '👑 管理员'
    WHEN role = 'family_member' THEN '👤 成员'
    WHEN role = 'storyteller' THEN '📖 讲述者'
    ELSE '❓ ' || role
  END as role_display
FROM profiles
WHERE email IS NOT NULL
ORDER BY created_at ASC;