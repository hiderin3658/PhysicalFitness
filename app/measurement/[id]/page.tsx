'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MeasurementForm from '../../components/MeasurementForm';
import { getUserById, createMeasurement } from '../../lib/db';
import { User, MeasurementFormData } from '../../../app/lib/types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MeasurementPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData: User | null = await getUserById(id);
        if (!userData) {
          setError('ユーザーが見つかりません');
        } else {
          setUser(userData);
        }
      } catch (err: unknown) {
        setError('ユーザー情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 測定データの送信
  const handleSubmit = async (data: MeasurementFormData) => {
    if (!user) {
      setError('ユーザー情報がありません');
      return;
    }

    try {
      // 文字列を数値に変換
      const measurementData = {
        userId: id,
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

      await createMeasurement(measurementData);
      
      // 測定結果ページへリダイレクト
      router.push(`/result/${id}`);
    } catch (err: unknown) {
      setError('測定データの保存に失敗しました');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">読み込み中...</div>;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'ユーザー情報が見つかりません'}
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
