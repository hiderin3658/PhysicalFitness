'use client';

import { useMemo } from 'react';

interface Measurement {
  id: string;
  measurementDate: string;
  height: number;
  weight: number;
  tug: {
    best: number;
  };
  walkingSpeed: {
    best: number;
  };
  fr: {
    best: number;
  };
  cs10: number;
  bi: number;
  notes: string;
}

interface ResultTableProps {
  measurements: Measurement[];
  maxItems?: number;
}

export default function ResultTable({ measurements, maxItems = 4 }: ResultTableProps) {
  // 最新の測定データを取得（最大maxItems件）
  const latestMeasurements = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime())
      .slice(0, maxItems);
  }, [measurements, maxItems]);

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

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-200 p-2 mb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold">評価結果</h2>
        <p className="text-sm text-gray-600">※TUGは数値が下がると改善</p>
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
                {measurement.height.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* 体重 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">体重</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.weight.toFixed(1)}
              </td>
            ))}
          </tr>

          {/* BMI */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">BMI</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {calculateBMI(measurement.height, measurement.weight).toFixed(2)}
              </td>
            ))}
          </tr>

          {/* TUG(秒) 歩行 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">TUG(秒) 歩行</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.tug.best.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* 5m歩行 (秒) 歩行速度 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">5m歩行 (秒) 歩行速度</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.walkingSpeed.best.toFixed(2)}
              </td>
            ))}
          </tr>

          {/* FR(cm) バランス */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">FR(cm) バランス</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.fr.best.toFixed(0)}
              </td>
            ))}
          </tr>

          {/* CS10 (回) 持久・下肢筋能力 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">CS10 (回) 持久・下肢筋能力</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.cs10}
              </td>
            ))}
          </tr>

          {/* BI */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">BI</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.bi}
              </td>
            ))}
          </tr>

          {/* 備考 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold">備考</td>
            {latestMeasurements.map((measurement) => (
              <td key={measurement.id} className="border border-gray-300 p-2 text-center">
                {measurement.notes}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
