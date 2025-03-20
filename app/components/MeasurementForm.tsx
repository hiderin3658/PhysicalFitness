'use client';

import { useState, FormEvent } from 'react';

interface MeasurementFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function MeasurementForm({ onSubmit, initialData = {} }: MeasurementFormProps) {
  const [formData, setFormData] = useState({
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
    notes: initialData.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // 最良値の計算
    const processedData = {
      ...formData,
      tug: {
        ...formData.tug,
        best: Math.min(
          parseFloat(formData.tug.first) || 0,
          parseFloat(formData.tug.second) || 0
        ),
      },
      walkingSpeed: {
        ...formData.walkingSpeed,
        best: Math.max(
          parseFloat(formData.walkingSpeed.first) || 0,
          parseFloat(formData.walkingSpeed.second) || 0
        ),
      },
      fr: {
        ...formData.fr,
        best: Math.max(
          parseFloat(formData.fr.first) || 0,
          parseFloat(formData.fr.second) || 0
        ),
      },
    };
    
    onSubmit(processedData);
  };

  const handleClear = () => {
    setFormData({
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
      notes: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">体力測定フォーム</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {/* 名前 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">名前</label>
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
                    step="0.1"
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
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* CS10 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">CS10</label>
              <input
                type="number"
                name="cs10"
                value={formData.cs10}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50"
                step="1"
              />
            </div>

            {/* 備考 */}
            <div className="flex items-center">
              <label className="w-32 text-right mr-4">備考</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="flex-1 p-2 rounded bg-red-50 h-24"
              />
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                クリア
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                送信
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
