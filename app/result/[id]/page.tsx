'use client';

import { useState, useEffect, use } from 'react';
import { getUserById, getMeasurementsByUserId } from '../../lib/db';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import ResultTable from '../../components/ResultTable';
import ResultChart from '../../components/ResultChart';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ユーザー情報の取得
        const userData = await getUserById(id);
        if (!userData) {
          setError('ユーザーが見つかりません');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        // 測定データの取得
        const measurementsData = await getMeasurementsByUserId(id);
        setMeasurements(measurementsData);
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      <h1 className="text-2xl font-bold mb-6">
        {user.lastName} {user.firstName}さんの評価結果
      </h1>
      
      {/* ユーザー基本情報 */}
      <UserInfoDisplay userInfo={user} />
      
      {/* 測定結果テーブル */}
      {measurements.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          測定データがありません
        </div>
      ) : (
        <>
          <ResultTable measurements={measurements} />
          <ResultChart measurements={measurements} />
        </>
      )}
    </div>
  );
}
