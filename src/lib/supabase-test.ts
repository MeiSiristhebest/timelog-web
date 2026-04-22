import { createClient } from '@/lib/supabase/client';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  const supabase = createClient();
  if (!supabase) {
    console.error('No Supabase client available');
    return;
  }

  // Test 1: Get session
  console.log('Test 1: Getting session...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Session result:', {
    hasSession: !!sessionData?.session,
    userId: sessionData?.session?.user?.id,
    error: sessionError?.message
  });

  if (!sessionData?.session?.user) {
    console.log('No authenticated user, cannot test profile queries');
    return;
  }

  const userId = sessionData.session.user.id;
  console.log('Authenticated user ID:', userId);

  // Test 2: Direct query by id
  console.log('Test 2: Querying profiles by id...');
  const { data: profileById, error: idError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('Profile by id result:', {
    found: !!profileById,
    role: profileById?.role,
    error: idError?.message,
    fullError: idError
  });

  // Test 3: Query by user_id
  console.log('Test 3: Querying profiles by user_id...');
  const { data: profileByUserId, error: userIdError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  console.log('Profile by user_id result:', {
    found: !!profileByUserId,
    role: profileByUserId?.role,
    error: userIdError?.message,
    fullError: userIdError
  });

  // Test 4: List all profiles (to check RLS)
  console.log('Test 4: Listing all profiles...');
  const { data: allProfiles, error: listError } = await supabase
    .from('profiles')
    .select('id, user_id, role, email')
    .limit(5);

  console.log('All profiles result:', {
    count: allProfiles?.length || 0,
    error: listError?.message,
    fullError: listError,
    profiles: allProfiles
  });
}

// Export for use in browser console
(window as any).testSupabaseConnection = testSupabaseConnection;