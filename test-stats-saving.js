// Test script to verify statistics saving
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStatsSaving() {
  console.log('Testing statistics saving...\n');

  // Get all users with their stats
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select(`
      *,
      user_stats (*)
    `)
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log('Total users:', users?.length || 0);
  console.log('\nUser statistics:');
  
  users?.forEach(user => {
    console.log(`\n${user.nickname} (${user.email}):`);
    if (user.user_stats && user.user_stats.length > 0) {
      const stats = user.user_stats[0];
      console.log(`  Total games: ${stats.total_games}`);
      console.log(`  Wins: ${stats.wins}`);
      console.log(`  Losses: ${stats.losses}`);
      console.log(`  Draws: ${stats.draws}`);
      console.log(`  Win rate: ${stats.win_rate}%`);
      console.log(`  Successful doubts: ${stats.successful_doubts}`);
    } else {
      console.log('  No statistics found');
    }
  });

  // Check recent game history
  const { data: gameHistory, error: historyError } = await supabase
    .from('game_history')
    .select('*')
    .order('played_at', { ascending: false })
    .limit(10);

  if (historyError) {
    console.error('\nError fetching game history:', historyError);
  } else {
    console.log('\n\nRecent game history (last 10 games):');
    gameHistory?.forEach((game, index) => {
      console.log(`\n${index + 1}. ${new Date(game.played_at).toLocaleString('ja-JP')}`);
      console.log(`   Difficulty: ${game.difficulty}`);
      console.log(`   Result: ${game.result}`);
      console.log(`   Score: ${game.black_count} - ${game.white_count}`);
      console.log(`   Doubt success: ${game.doubt_success}`);
    });
  }
}

testStatsSaving();