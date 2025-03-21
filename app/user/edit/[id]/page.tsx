'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    gender: '男性',
    birthDate: '',
    medicalHistory: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既往歴の選択肢
  const medicalHistoryOptions = [
    '高血圧', '糖尿病', '心疾患', '脳卒中', '関節症'
  ];

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('編集ページ: ユーザーデータ取得開始 - ID:', id);
        
        // APIで直接ユーザーデータを取得
        const response = await fetch(`/api/users/${id}`);
        console.log('編集ページ: APIレスポンスステータス:', response.status);
        
        const data = await response.json();
        console.log('編集ページ: APIレスポンス:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'ユーザーの取得に失敗しました');
        }
        
        if (!data) {
          console.error('編集ページ: ユーザーが見つかりません - ID:', id);
          setError('ユーザーが見つかりません');
        } else {
          console.log('編集ページ: ユーザーデータ取得成功:', data);
          setFormData({
            lastName: data.lastName,
            firstName: data.firstName,
            gender: data.gender,
            birthDate: data.birthDate,
            medicalHistory: data.medicalHistory || [],
          });
          console.log('編集ページ: フォームデータを設定しました');
        }
      } catch (err) {
        console.error('編集ページ: ユーザー情報取得エラー:', err);
        if (err instanceof Error) {
          setError(`ユーザー情報の取得に失敗しました: ${err.message}`);
        } else {
          setError('ユーザー情報の取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

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
    setSaving(true);
    setError(null);

    try {
      console.log('編集ページ: ユーザー更新開始 - ID:', id, 'データ:', formData);
      
      // API経由での更新
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('編集ページ: APIレスポンスステータス:', response.status);
      
      const result = await response.json();
      console.log('編集ページ: APIレスポンス:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'ユーザー更新に失敗しました');
      }
      
      console.log('編集ページ: ユーザー更新成功');
      router.push('/'); // ホームページにリダイレクト
    } catch (err) {
      console.error('編集ページ: 更新エラー:', err);
      if (err instanceof Error) {
        setError(`ユーザー情報の更新に失敗しました: ${err.message}`);
      } else {
        setError('ユーザー情報の更新に失敗しました');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">読み込み中...</div>;
  }

  if (error && !formData.lastName) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">ユーザー情報編集</h1>
      
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
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
