'use client';

import { useMemo, useState, useEffect } from 'react';

interface Measurement {
  id: string;
  measurementDate: string;
  height?: number;
  weight?: number;
  tug?: {
    best: number;
    first?: number;
    second?: number;
  };
  walkingSpeed?: {
    best: number;
    first?: number;
    second?: number;
  } | number;
  fr?: {
    best: number;
    first?: number;
    second?: number;
  };
  cs10?: number;
  bi?: number;
  notes?: string;
}

interface ResultTableProps {
  measurements: Measurement[];
  maxItems?: number;
  onBiValueUpdate?: (measurementId: string, newBiValue: number) => void;
}

export default function ResultTable({ measurements, maxItems = 4, onBiValueUpdate }: ResultTableProps) {
  // 最新の測定データを取得（最大maxItems件）
  const latestMeasurements = useMemo(() => {
    console.log('ResultTable: 測定データから最新データを計算:', measurements.length);
    
    if (!measurements || measurements.length === 0) {
      console.log('ResultTable: 測定データがありません');
      return [];
    }
    
    // 測定日で古い順に並び替え（昇順）
    const sorted = [...measurements]
      .sort((a, b) => {
        // 日付が有効かチェック
        const dateA = new Date(a.measurementDate);
        const dateB = new Date(b.measurementDate);
        
        if (isNaN(dateA.getTime())) {
          console.warn(`ResultTable: 無効な日付 - ${a.id}: ${a.measurementDate}`);
          return 1; // 無効な日付は後ろに
        }
        if (isNaN(dateB.getTime())) {
          console.warn(`ResultTable: 無効な日付 - ${b.id}: ${b.measurementDate}`);
          return -1; // 無効な日付は後ろに
        }
        
        return dateA.getTime() - dateB.getTime(); // 昇順（古い→新しい）
      })
      .slice(0, maxItems);
    
    console.log('ResultTable: ソート後の測定データ（古い順）:', sorted.map(m => `${m.id} (${m.measurementDate}): BI=${m.bi}`));
    return sorted;
  }, [measurements, maxItems]);

  // BIの値の状態管理（各測定データごとにステートを持つ）
  const [biValues, setBiValues] = useState<Record<string, string>>({});

  // 保存中の状態管理（各測定データごとに状態を持つ）
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // コンポーネントがマウントされたときと、measurementsが変更されたときにbiValuesを更新
  useEffect(() => {
    console.log('ResultTable: 測定データが更新されました。件数:', latestMeasurements.length);
    
    if (latestMeasurements.length === 0) {
      console.log('ResultTable: 表示する測定データがありません');
      return;
    }
    
    // 各測定データのBI値をログ出力
    latestMeasurements.forEach(m => {
      console.log(`ResultTable: 測定ID ${m.id}, BI値 ${m.bi}`);
    });
    
    // 新しいBI値の状態を構築
    const newBiValues: Record<string, string> = {};
    latestMeasurements.forEach(measurement => {
      // biが存在し、数値として有効な場合のみ文字列に変換
      const biValue = typeof measurement.bi === 'number' && !isNaN(measurement.bi) 
        ? measurement.bi.toString() 
        : '0';
      
      newBiValues[measurement.id] = biValue;
      console.log(`ResultTable: 測定ID ${measurement.id} のBI値を ${biValue} に設定`);
    });
    
    console.log('ResultTable: 新しいBI値状態:', newBiValues);
    setBiValues(newBiValues);
  }, [latestMeasurements]);

  // BI値の変更ハンドラ
  const handleBiChange = (measurementId: string, value: string) => {
    setBiValues(prev => ({
      ...prev,
      [measurementId]: value
    }));
  };

  // BMIの計算
  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  };

  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // BI値を保存する関数
  const saveBiValue = async (measurementId: string) => {
    try {
      setSavingStates(prev => ({
        ...prev,
        [measurementId]: true
      }));
      
      // 入力されたBI値を取得（フォールバック用に保存）
      const inputValue = biValues[measurementId];
      const numericBiValue = parseInt(inputValue) || 0;
      console.log(`ResultTable: ${measurementId}のBI値を${numericBiValue}に更新します`);
      
      // 保存前に入力値を状態に保存して、何があっても表示を維持
      setBiValues(prev => ({
        ...prev,
        [measurementId]: numericBiValue.toString()
      }));
      
      // APIへの更新は背景で行い、先に入力値を確定
      let apiSuccess = false;
      
      try {
        // 先にレコードが存在するか確認
        const checkResponse = await fetch(`/api/measurements/${measurementId}?cache=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            console.error('ResultTable: 指定された測定データが見つかりません。ページを再読み込みしてください。');
            // エラーをスローしないで処理を続行
          } else {
            console.error('ResultTable: 測定データの確認に失敗しました', checkResponse.status);
            // エラーをスローしないで処理を続行
          }
        } else {
          // 保存前の測定データを取得
          const existingData = await checkResponse.json();
          console.log(`ResultTable: 保存前の測定データ - ID: ${measurementId}, 現在のBI値: ${existingData.bi}`);
          
          // BI値が変更されていない場合は、更新をスキップ
          if (existingData.bi === numericBiValue) {
            console.log(`ResultTable: BI値に変更がないため更新をスキップします（現在値: ${existingData.bi}）`);
            apiSuccess = true; // 既に同じ値なので成功とみなす
          } else {
            // APIを使用してBIの値を更新 - キャッシュ無効化のためのタイムスタンプを追加
            const timestamp = Date.now();
            const response = await fetch(`/api/measurements/${measurementId}?t=${timestamp}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
              body: JSON.stringify({
                bi: numericBiValue
              }),
              cache: 'no-store'
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('ResultTable: サーバーエラー詳細:', errorData);
              throw new Error(errorData.error || 'BI値の更新に失敗しました');
            }

            // 更新されたデータを取得
            const updatedData = await response.json();
            console.log('ResultTable: 保存成功、更新データ:', updatedData);

            // 更新されたデータからBI値を抽出
            const updatedBiValue = updatedData?.bi;
            
            // サーバー側で返されたBI値が元の入力値と異なる場合は、ログに警告を出力
            if (updatedBiValue !== numericBiValue) {
              console.warn(`ResultTable: サーバーから返されたBI値(${updatedBiValue})が入力値(${numericBiValue})と異なります。入力値を優先します。`);
            } else {
              console.log(`ResultTable: サーバー応答のBI値が入力値と一致しています: ${updatedBiValue}`);
            }
            
            apiSuccess = true;
          }
        }
      } catch (apiError) {
        console.error('ResultTable: API通信エラー:', apiError);
        // エラーをスローせず、UIの状態を保持
      }
      
      // 成功メッセージを表示 - 実際のAPI成功状態に関わらずUIは一貫性を保つ
      if (apiSuccess) {
        alert('BI値を保存しました');
      } else {
        alert('BI値を表示に反映しました（サーバーへの保存に問題がありました。再度保存を試してください）');
      }
      
      // 親コンポーネントに更新を通知
      if (onBiValueUpdate) {
        console.log(`ResultTable: 親コンポーネントに通知 - 測定ID: ${measurementId}, BI値: ${numericBiValue}`);
        onBiValueUpdate(measurementId, numericBiValue);
      }
      
    } catch (error) {
      console.error('ResultTable: BI値の保存に失敗しました', error);
      let errorMessage = 'BI値の保存に失敗しました';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSavingStates(prev => ({
        ...prev,
        [measurementId]: false
      }));
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-200 p-2 flex justify-between items-center">
        <h2 className="text-lg font-bold">評価結果</h2>
      </div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">項目</th>
            {latestMeasurements.map((measurement) => (
              <th key={measurement.id} className="border border-gray-300 p-2">
                {formatDate(measurement.measurementDate)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 身長 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">身長</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.height?.toFixed(2) || ''}
              </td>
            ))}
          </tr>

          {/* 体重 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">体重</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.weight?.toFixed(1) || ''}
              </td>
            ))}
          </tr>

          {/* BMI */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">BMI</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {calculateBMI(measurement.height || 0, measurement.weight || 0).toFixed(2)}
              </td>
            ))}
          </tr>

          {/* TUG(秒) 歩行 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">TUG(秒) 歩行</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.tug?.best.toFixed(2) || ''}
              </td>
            ))}
          </tr>

          {/* 5m歩行 (秒) 歩行速度 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">5m歩行 (秒) 歩行速度</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {typeof measurement.walkingSpeed === 'object' && measurement.walkingSpeed?.best 
                  ? measurement.walkingSpeed.best.toFixed(2) 
                  : typeof measurement.walkingSpeed === 'number' 
                    ? measurement.walkingSpeed.toFixed(2)
                    : ''}
              </td>
            ))}
          </tr>

          {/* FR(cm) バランス */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">FR(cm) バランス</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.fr?.best.toFixed(0) || ''}
              </td>
            ))}
          </tr>

          {/* CS10 (回) 持久・下肢筋能力 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">CS10 (回) 持久・下肢筋能力</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.cs10 || ''}
              </td>
            ))}
          </tr>

          {/* BI */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">BI（Barthel Index）</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="number"
                    className="p-1 border border-gray-300 rounded w-20 text-center"
                    placeholder="BI値"
                    value={biValues[measurement.id] || ''}
                    onChange={(e) => handleBiChange(measurement.id, e.target.value)}
                    min="0"
                    max="100"
                  />
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                    onClick={() => saveBiValue(measurement.id)}
                    disabled={savingStates[measurement.id]}
                  >
                    {savingStates[measurement.id] ? '保存中...' : '保存'}
                  </button>
                </div>
              </td>
            ))}
          </tr>

          {/* 備考 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">備考</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.notes || ''}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}