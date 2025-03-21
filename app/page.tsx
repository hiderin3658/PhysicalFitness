import { getUsers } from './lib/db';
import UserList from './components/UserList';

// キャッシュを無効化（必要な場合のみ）
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const users = await getUsers() || [];
    
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">ユーザー一覧</h1>
        <UserList users={users} />
      </div>
    );
  } catch (error) {
    console.error('ホームページでのエラー:', error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-red-600">エラーが発生しました</h1>
        <p>データの読み込み中にエラーが発生しました。詳細はコンソールを確認してください。</p>
        <div className="mt-4 text-gray-700">
          以下を確認してください:
        </div>
        <ul className="list-disc ml-6 mt-2">
          <li>環境変数が正しく設定されているか</li>
          <li>Supabaseが正常に動作しているか</li>
          <li>インターネット接続が正常か</li>
        </ul>
      </div>
    );
  }
}
