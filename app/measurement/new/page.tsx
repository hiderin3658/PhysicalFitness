'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MeasurementForm from '../../components/MeasurementForm';
import { User, MeasurementFormData } from '../../lib/types';

export default function NewMeasurementPage() {
  const router = useRouter();
  
  // useSearchParamsをSuspense境界内で使用
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">体力測定データ入力</h1>
      <Suspense fallback={<div>ロード中...</div>}>
        <MeasurementPageContent />
      </Suspense>
    </div>
  );
}

// コンテンツコンポーネントを分離
function MeasurementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーの取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userId) {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
            throw new Error('ユーザー情報の取得に失敗しました');
          }
          const user = await response.json();
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
  const handleSubmit = async (data: MeasurementFormData) => {
    if (!selectedUser) {
      setError('ユーザーが見つかりません');
      return;
    }

    try {
      // 文字列を数値に変換
      const measurementData = {
        userId: selectedUser.id,
        measurementDate: data.measurementDate,
        height: Number(data.height),
        weight: Number(data.weight),
        tug: {
          first: Number(data.tug.first),
          second: Number(data.tug.second),
          best: Number(data.tug.best || Math.min(Number(data.tug.first), Number(data.tug.second))),
        },
        walkingSpeed: {
          first: Number(data.walkingSpeed.first),
          second: Number(data.walkingSpeed.second),
          best: Number(data.walkingSpeed.best || Math.max(Number(data.walkingSpeed.first), Number(data.walkingSpeed.second))),
        },
        fr: {
          first: Number(data.fr.first),
          second: Number(data.fr.second),
          best: Number(data.fr.best || Math.max(Number(data.fr.first), Number(data.fr.second))),
        },
        cs10: Number(data.cs10),
        bi: Number(data.bi || 0), // biがない場合は0をデフォルト値として使用
        notes: data.notes,
      };

      // APIでデータを保存
      const response = await fetch('/api/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurementData),
      });

      if (!response.ok) {
        throw new Error('測定データの保存に失敗しました');
      }
      
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
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {selectedUser && (
        <MeasurementForm onSubmit={handleSubmit} selectedUser={selectedUser} />
      )}
      
      {!selectedUser && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          ユーザーが見つかりません
        </div>
      )}
    </>
  );
}
