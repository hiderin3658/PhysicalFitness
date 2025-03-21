'use client';

import { useState, FormEvent } from 'react';
import { MeasurementFormData } from '../lib/types';
import { createMeasurement } from '../lib/db';
import { useRouter } from 'next/navigation';
import { userId } from '../lib/auth';

interface MeasurementFormProps {
  onSubmit: (data: MeasurementFormData) => void;
  initialData?: Partial<MeasurementFormData>;
}

export default function MeasurementForm({ onSubmit, initialData = {} }: MeasurementFormProps) {
  const [formData, setFormData] = useState<MeasurementFormData>({
    userId: userId,
    name: initialData.name || '',
    measurementDate: initialData.measurementDate || new Date().toISOString().split('T')[0],
    height: initialData.height || '',
    weight: initialData.weight || '',
    tug: {
      first: initialData.tug?.first || '',
      second: initialData.tug?.second || '',
    },
    walkingSpeed: {
      first: initialData.walkingSpeed?.first || '',
      second: initialData.walkingSpeed?.second || '',
    },
    fr: {
      first: initialData.fr?.first || '',
      second: initialData.fr?.second || '',
    },
    cs10: initialData.cs10 || '',
    bi: initialData.bi || '',
    notes: initialData.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string | number>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedData: MeasurementFormData = {
      userId: userId, 
      measurementDate: formData.measurementDate,
      height: parseFloat(formData.height as string) || 0, 
      weight: parseFloat(formData.weight as string) || 0, 
      tug: {
        first: parseFloat(formData.tug.first as string) || 0,
        second: parseFloat(formData.tug.second as string) || 0,
        best: Math.min(
          parseFloat(formData.tug.first as string) || 0,
          parseFloat(formData.tug.second as string) || 0
        ),
      },
      walkingSpeed: {
        first: parseFloat(formData.walkingSpeed.first as string) || 0,
        second: parseFloat(formData.walkingSpeed.second as string) || 0,
        best: Math.min(
          parseFloat(formData.walkingSpeed.first as string) || 0,
          parseFloat(formData.walkingSpeed.second as string) || 0
        ),
      },
      fr: {
        first: parseFloat(formData.fr.first as string) || 0,
        second: parseFloat(formData.fr.second as string) || 0,
        best: Math.max(
          parseFloat(formData.fr.first as string) || 0,
          parseFloat(formData.fr.second as string) || 0
        ),
      },
      cs10: parseFloat(formData.cs10 as string) || 0, 
      bi: parseFloat(formData.bi as string) || 0, 
      notes: formData.notes, 
    };

    try {
      await createMeasurement(processedData);
      alert('測定データが保存されました');
      router.push(`/result/${userId}`);
    } catch (error) {
      console.error('測定データの保存に失敗しました', error);
      alert('測定データの保存に失敗しました');
    }
  };

  const handleClear = () => {
    setFormData({
      userId: userId,
      name: '',
      measurementDate: new Date().toISOString().split('T')[0],
      height: '',
      weight: '',
      tug: {
        first: '',
        second: '',
      },
      walkingSpeed: {
        first: '',
        second: '',
      },
      fr: {
        first: '',
        second: '',
      },
      cs10: '',
      bi: '',
      notes: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">体力測定フォーム</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {/* 氏名 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">氏名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                required
              />
            </div>

            {/* 測定日 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">測定日</label>
              <input
                type="date"
                name="measurementDate"
                value={formData.measurementDate}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                required
              />
            </div>

            {/* 身長 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">身長</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                step="0.1"
                required
              />
              <span className="ml-2">cm</span>
            </div>

            {/* 体重 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">体重</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                step="0.1"
                required
              />
              <span className="ml-2">kg</span>
            </div>

            {/* TUG */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">TUG</label>
              <div className="flex-1 flex space-x-4">
                <div className="flex-1 flex items-center">
                  <span className="mr-2">1回目</span>
                  <input
                    type="number"
                    name="tug.first"
                    value={formData.tug.first}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
                <div className="flex-1 flex items-center">
                  <span className="mr-2">2回目</span>
                  <input
                    type="number"
                    name="tug.second"
                    value={formData.tug.second}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* 5m歩行 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">5m歩行</label>
              <div className="flex-1 flex space-x-4">
                <div className="flex-1 flex items-center">
                  <span className="mr-2">1回目</span>
                  <input
                    type="number"
                    name="walkingSpeed.first"
                    value={formData.walkingSpeed.first}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
                <div className="flex-1 flex items-center">
                  <span className="mr-2">2回目</span>
                  <input
                    type="number"
                    name="walkingSpeed.second"
                    value={formData.walkingSpeed.second}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* FR */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">FR</label>
              <div className="flex-1 flex space-x-4">
                <div className="flex-1 flex items-center">
                  <span className="mr-2">1回目</span>
                  <input
                    type="number"
                    name="fr.first"
                    value={formData.fr.first}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
                <div className="flex-1 flex items-center">
                  <span className="mr-2">2回目</span>
                  <input
                    type="number"
                    name="fr.second"
                    value={formData.fr.second}
                    onChange={handleChange}
                    className="flex-1 p-2 rounded bg-red-50"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* CS-10 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">CS-10</label>
              <input
                type="number"
                name="cs10"
                value={formData.cs10}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                step="0.1"
                required
              />
            </div>

            {/* BI */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">BI</label>
              <input
                type="number"
                name="bi"
                value={formData.bi}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                step="0.1"
                required
              />
            </div>

            {/* 備考 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">備考</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              送信
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              クリア
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
