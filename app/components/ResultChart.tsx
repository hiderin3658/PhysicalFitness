'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Measurement {
  id: string;
  measurementDate: string;
  tug?: {
    best: number;
  };
  walkingSpeed?: {
    best: number;
  } | number;
  fr?: {
    best: number;
  };
  cs10?: number;
  bi?: number;
}

interface ResultChartProps {
  measurements: Measurement[];
  maxItems?: number;
}

export default function ResultChart({ measurements, maxItems = 4 }: ResultChartProps) {
  // 最新の測定データを取得（最大maxItems件）
  const latestMeasurements = useMemo(() => {
    return [...measurements]
      .sort((a, b) => {
        // 日付の比較（昇順 - 古い→新しい）
        const dateA = new Date(a.measurementDate).getTime();
        const dateB = new Date(b.measurementDate).getTime();
        
        if (isNaN(dateA) || isNaN(dateB)) {
          // 無効な日付の処理
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1; // 無効な日付は後ろに
          if (isNaN(dateB)) return -1; // 無効な日付は後ろに
        }
        
        return dateA - dateB; // 昇順（古い→新しい）
      })
      .slice(0, maxItems);
  }, [measurements, maxItems]);

  // 日付のフォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // グラフデータの作成
  const chartData = useMemo(() => {
    const labels = latestMeasurements.map(m => formatDate(m.measurementDate));
    
    return {
      labels,
      datasets: [
        {
          label: 'TUG',
          data: latestMeasurements.map(m => m.tug?.best || 0),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: '5m歩行',
          data: latestMeasurements.map(m => {
            if (typeof m.walkingSpeed === 'object') {
              return m.walkingSpeed?.best || 0;
            } else if (typeof m.walkingSpeed === 'number') {
              return m.walkingSpeed;
            }
            return 0;
          }),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'FR',
          data: latestMeasurements.map(m => m.fr?.best || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'CS10',
          data: latestMeasurements.map(m => m.cs10 || 0),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
        },
        {
          label: 'BI',
          data: latestMeasurements.map(m => m.bi || 0),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    };
  }, [latestMeasurements]);

  // グラフオプション
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
      },
    },
  };

  return (
    <div className="mt-8">
      <Line options={options} data={chartData} />
      
      <div className="bg-gray-200 p-2 mt-8">
        <h2 className="text-lg font-bold">体力測定からの評価</h2>
      </div>
      
      <div className="mt-0">
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
          placeholder="体力測定の評価結果や特記事項を入力してください"
        ></textarea>
      </div>
    </div>
  );
}
