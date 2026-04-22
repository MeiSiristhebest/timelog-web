-- 诊断Authentication用户与Profiles表不匹配的问题
-- 在Supabase SQL Editor中运行

-- 1. 查看所有Authentication用户
-- 注意：这需要适当的权限，可能无法直接查询auth.users表

-- 2. 查看Profiles表中的所有记录
SELECT
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  CASE
    WHEN p.id = p.user_id THEN '匹配'
    ELSE '不匹配'
  END as id_consistency,
  CASE
    WHEN p.role IS NULL THEN '无角色'
    WHEN p.role = 'family_owner' THEN '管理员'
    WHEN p.role = 'family_member' THEN '成员'
    ELSE '未知角色: ' || p.role
  END as role_status
FROM profiles p
ORDER BY p.created_at DESC;

-- 3. 检查是否有重复或缺失的记录
SELECT
  COUNT(*) as total_profiles,
  COUNT(DISTINCT id) as unique_ids,
  COUNT(DISTINCT user_id) as unique_user_ids,
  COUNT(DISTINCT email) as unique_emails
FROM profiles;

-- 4. 查找可能的孤立记录（没有对应auth用户的profiles）
-- 这需要auth.users表的访问权限

-- 5. 清理和修复脚本
-- 删除无效的profiles记录（如果有的话）
-- UPDATE profiles SET role = 'family_member' WHERE role IS NULL;

-- 6. 手动创建缺失的profiles记录（如果需要）
-- INSERT INTO profiles (id, user_id, email, display_name, role)
-- VALUES ('auth-user-id', 'auth-user-id', 'user@example.com', 'Display Name', 'family_member');

-- 7. 重新同步所有profiles的角色
-- UPDATE profiles SET role = 'family_member' WHERE role IS NULL OR role = '';
-- UPDATE profiles SET role = 'family_owner' WHERE email = 'admin@example.com';