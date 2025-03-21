'use client';

import Link from 'next/link';

interface User {
  id: string;
  lastName: string;
  firstName: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users = [] }: UserListProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link 
          href="/user/create" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          新規ユーザー追加
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {users.length === 0 ? (
          <p className="p-4 text-center text-gray-500">登録されているユーザーはいません</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{user.lastName} {user.firstName}</span>
                  <div className="flex space-x-2">
                    <Link
                      href={`/user/edit/${user.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/measurement/new?userId=${user.id}`}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      測定入力
                    </Link>
                    <Link
                      href={`/result/${user.id}`}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      評価結果
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
