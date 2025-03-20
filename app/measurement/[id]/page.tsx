'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MeasurementForm from '../../components/MeasurementForm';
import { getUserById, createMeasurement } from '../../lib/db';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MeasurementPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(id);
        if (!userData) {
          setError('ユーザーが見つかりません');
        } else {
          setUser(userData);
        }
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 測定データの送信
  const handleSubmit = async (data: any) => {
    try {
      // ユーザーIDを追加
      const measurementData = {
        ...data,
        userId: id,
      };

      await createMeasurement(measurementData);
      
      // 測定結果ページへリダイレクト
      router.push(`/result/${id}`);
    } catch (err) {
      setError('測定データの保存に失敗しました');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">読み込み中...</div>;
  }

  if (error) {
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
      <h1 className="text-2xl font-bold mb-6 text-center">
        {user.lastName} {user.firstName}さんの体力測定
      </h1>
      <MeasurementForm onSubmit={handleSubmit} />
    </div>
  );
}
