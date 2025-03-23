'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // 測定データを取得する関数
  const fetchMeasurements = useCallback(async () => {
    try {
      console.log(`ResultPage: ユーザーID: ${id}の測定データを取得します (${new Date().toISOString()})`);
      
      // キャッシュを確実に無効化して測定データを取得
      const timestamp = Date.now();
      const response = await fetch(`/api/users/${id}/measurements?t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.error('ResultPage: API応答エラー:', response.status, response.statusText);
        let errorMessage = '測定データの取得に失敗しました';
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = `${errorMessage}: ${errorData.error}`;
          }
        } catch (e) {
          console.error('ResultPage: エラーレスポンスの解析に失敗:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      const measurementsData = await response.json();
      console.log('ResultPage: 取得した測定データ:', measurementsData);
      
      if (!Array.isArray(measurementsData)) {
        console.error('ResultPage: 予期しないレスポンス形式:', measurementsData);
        throw new Error('測定データのフォーマットが不正です');
      }
      
      // 各測定データのBI値を確認し、ログに出力
      measurementsData.forEach(measurement => {
        console.log(`ResultPage: 測定ID: ${measurement.id}, BI値: ${measurement.bi}, 日付: ${measurement.measurementDate}`);
      });
      
      // 測定日で昇順ソート（古い→新しい）
      const sortedMeasurements = [...measurementsData].sort((a, b) => {
        const dateA = new Date(a.measurementDate).getTime();
        const dateB = new Date(b.measurementDate).getTime();
        // 日付が不正な場合は特別に処理
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;  // 不正な日付は後ろに
        if (isNaN(dateB)) return -1; // 不正な日付は後ろに
        return dateA - dateB; // 昇順（古い→新しい）
      });
      
      console.log('ResultPage: ソート後の測定データ（古い順）:', sortedMeasurements.map(m => `${m.id} (${m.measurementDate}): BI=${m.bi}`));
      setMeasurements(sortedMeasurements);
    } catch (err) {
      console.error('ResultPage: 測定データ取得エラー:', err);
      setError(err instanceof Error ? err.message : '測定データの取得に失敗しました');
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ユーザー情報の取得
        const userData = await getUserById(id);
        if (!userData) {
          setError('ユーザーが見つかりません');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        // 測定データの取得
        await fetchMeasurements();
      } catch (err) {
        setError('データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fetchMeasurements]);

  // BI値が更新されたときのハンドラ
  const handleBiValueUpdate = useCallback((measurementId: string, newBiValue: number) => {
    console.log(`ResultPage: 測定ID: ${measurementId}のBI値が${newBiValue}に更新されました`);
    
    // 1. 即時UIを更新するためにmeasurementsステートを更新
    setMeasurements(prevMeasurements => 
      prevMeasurements.map(measurement => 
        measurement.id === measurementId 
          ? { ...measurement, bi: newBiValue } 
          : measurement
      )
    );
    
    // 2. 確実にデータが最新になるよう、更新からわずかに遅延させてデータを再取得
    setTimeout(() => {
      console.log('ResultPage: 更新後にデータを再取得します');
      fetchMeasurements()
        .catch(error => {
          console.error('ResultPage: データ再取得エラー:', error);
        });
    }, 500); // 500ms遅延させてデータベース更新が確実に反映されるようにする
  }, [fetchMeasurements]);

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
          <ResultTable 
            measurements={measurements} 
            onBiValueUpdate={handleBiValueUpdate}
          />
          <ResultChart measurements={measurements} />
        </>
      )}
    </div>
  );
}
