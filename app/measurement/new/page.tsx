'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MeasurementForm from '../../components/MeasurementForm';
import { getUsers, getUserById, createMeasurement } from '../../lib/db';

export default function NewMeasurementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userId) {
          const user = await getUserById(userId);
          if (user) {
            setSelectedUser(user);
          }
        }
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 測定データの送信
  const handleSubmit = async (data: any) => {
    if (!selectedUser) {
      setError('ユーザーが見つかりません');
      return;
    }

    try {
      // ユーザーIDを追加
      const measurementData = {
        ...data,
        userId: selectedUser.id,
      };

      await createMeasurement(measurementData);
      
      // 測定結果ページへリダイレクト
      router.push(`/result/${selectedUser.id}`);
    } catch (err) {
      setError('測定データの保存に失敗しました');
      console.error(err);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">体力測定データ入力</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {selectedUser && (
        <MeasurementForm onSubmit={handleSubmit} />
      )}
      
      {!selectedUser && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          ユーザーが見つかりません
        </div>
      )}
    </div>
  );
}
