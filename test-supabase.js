// Supabase接続テスト
// 注意: このファイルを実行するには、.env.localに正しい認証情報が必要です

const checkSupabaseConnection = () => {
  console.log('=== Supabase接続状況 ===\n');
  
  // 環境変数の確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('1. 環境変数チェック:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '設定済み' : '未設定'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '設定済み' : '未設定'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Supabaseに接続するには環境変数の設定が必要です。');
    console.log('   .env.localファイルを作成し、以下を設定してください:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    return;
  }
  
  console.log('\n✅ 環境変数は設定されています。');
  console.log('\n2. 現在のデータ保存方法:');
  console.log('   現在はlocalStorageを使用しています（ブラウザ内保存）');
  console.log('   Supabaseへの移行は実装されていません。');
  
  console.log('\n3. Supabaseを使用するには:');
  console.log('   - supabase/schema.sqlを実行してテーブルを作成');
  console.log('   - コード内のlocalStorageをSupabaseクライアントに置き換える');
  console.log('   - 認証機能の実装');
};

// Node.js環境で実行する場合
if (typeof window === 'undefined') {
  require('dotenv').config({ path: '.env.local' });
  checkSupabaseConnection();
}