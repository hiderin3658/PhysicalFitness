'use client';

import { useState, useEffect } from 'react';
import { getUserById, getMeasurementsByUserId } from '../../lib/db';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import ResultTable from '../../components/ResultTable';
import ResultChart from '../../components/ResultChart';
import { User, Measurement } from '../../lib/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ResultPage({ params }: PageProps) {
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
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
        // 測定日で降順ソート
        const sortedMeasurements = [...measurementsData].sort((a, b) => 
          new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
        );
        setMeasurements(sortedMeasurements);
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
