'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUser } from '../../lib/db';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    gender: '男性',
    birthDate: '',
    medicalHistory: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既往歴の選択肢
  const medicalHistoryOptions = [
    '高血圧', '糖尿病', '心疾患', '脳卒中', '関節症'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        medicalHistory: [...formData.medicalHistory, value],
      });
    } else {
      setFormData({
        ...formData,
        medicalHistory: formData.medicalHistory.filter(item => item !== value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('フロントエンド: ユーザー作成開始', formData);
      
      // API経由でユーザーを作成
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('フロントエンド: APIレスポンスステータス:', response.status);
      
      const result = await response.json();
      console.log('フロントエンド: APIレスポンス:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'ユーザー作成に失敗しました');
      }
      
      console.log('フロントエンド: ユーザー作成成功:', result);
      
      // ユーザー登録成功後、リダイレクト先でリロードするために
      // クエリパラメータを追加してリダイレクト
      router.push('/?reload=true');
    } catch (err) {
      console.error('フロントエンド: ユーザー作成エラー:', err);
      setError(`ユーザーの作成に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">新規ユーザー登録</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓 */}
            <div>
              <label className="block text-gray-700 mb-2">姓</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            {/* 名 */}
            <div>
              <label className="block text-gray-700 mb-2">名</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            {/* 性別 */}
            <div>
              <label className="block text-gray-700 mb-2">性別</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
              </select>
            </div>
            
            {/* 生年月日 */}
            <div>
              <label className="block text-gray-700 mb-2">生年月日</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
          
          {/* 既往歴 */}
          <div className="mt-6">
            <label className="block text-gray-700 mb-2">既往歴</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {medicalHistoryOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`medical-${option}`}
                    name="medicalHistory"
                    value={option}
                    checked={formData.medicalHistory.includes(option)}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor={`medical-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* ボタン */}
          <div className="flex justify-end space-x-4 mt-6">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}