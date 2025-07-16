export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ダウトオセロ</h1>
      <p className="text-xl mb-8">AIの不正を見破る新感覚オセロゲーム</p>
      <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        ゲームを開始
      </button>
    </main>
  );
}