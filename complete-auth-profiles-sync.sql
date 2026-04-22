-- 完整修复：同步Authentication用户到Profiles表
-- 在Supabase SQL Editor中按顺序运行

-- =============================================
-- 第一步：更新表结构以支持应用角色
-- =============================================

-- 移除旧的角色检查约束
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 添加新的角色检查约束
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('super_admin', 'family_owner', 'family_member', 'guest', 'storyteller', 'family'));

-- =============================================
-- 第二步：备份现有数据（如果需要）
-- =============================================

-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- =============================================
-- 第三步：同步所有Authentication用户
-- =============================================

-- 为所有auth.users中没有profiles记录的用户创建profiles
INSERT INTO profiles (
  id,
  user_id,
  email,
  display_name,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.id,
  au.email,
  -- 从用户元数据中提取显示名称，如果没有则使用邮箱前缀
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1),
    'User'
  ),
  -- 完整姓名
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'display_name',
    'User'
  ),
  -- 默认角色设为family_member
  'family_member',
  -- 使用auth用户的创建时间
  COALESCE(au.created_at, au.last_sign_in_at, now()),
  now()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- =============================================
-- 第四步：设置管理员角色
-- =============================================

-- 为最早注册的用户设置管理员角色
UPDATE profiles
SET role = 'family_owner'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
);

-- =============================================
-- 第五步：数据验证
-- =============================================

-- 查看同步结果
SELECT
  '同步结果' as check_type,
  (SELECT COUNT(*) FROM auth.users) as auth_users_total,
  (SELECT COUNT(*) FROM profiles) as profiles_total,
  (SELECT COUNT(*) FROM profiles WHERE role IS NOT NULL) as profiles_with_role,
  (SELECT COUNT(*) FROM profiles WHERE role = 'family_owner') as admin_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'family_member') as member_count;

-- 详细查看每个用户
SELECT
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  CASE
    WHEN p.role = 'family_owner' THEN '👑 管理员'
    WHEN p.role = 'family_member' THEN '👤 成员'
    ELSE '❓ ' || p.role
  END as role_display,
  CASE
    WHEN p.id = p.user_id THEN '✅ 匹配'
    ELSE '❌ 不匹配'
  END as id_consistency
FROM profiles p
ORDER BY p.created_at ASC;

-- =============================================
-- 第六步：清理和优化（可选）
-- =============================================

-- 确保所有profiles都有正确的user_id
UPDATE profiles
SET user_id = id
WHERE user_id IS NULL OR user_id != id;

-- 更新任何缺失的角色
UPDATE profiles
SET role = 'family_member'
WHERE role IS NULL OR role = '';

-- =============================================
-- 第七步：最终验证
-- =============================================

-- 确认所有auth用户都有对应的profiles
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) THEN '✅ 完全同步'
    ELSE '❌ 同步不完整'
  END as sync_status,
  (SELECT COUNT(*) FROM auth.users) as auth_count,
  (SELECT COUNT(*) FROM profiles) as profile_count,
  ((SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles)) as missing_profiles;