'use client';

import { formatDate, calculateAge } from '../lib/utils';
import { User } from '../lib/types';

interface UserInfoDisplayProps {
  userInfo: User | null;
}

export default function UserInfoDisplay({ userInfo }: UserInfoDisplayProps) {
  if (!userInfo) {
    return (
      <div className="mb-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          ユーザー情報が見つかりません
        </div>
      </div>
    );
  }
  
  const { lastName, firstName, gender, birthDate, medicalHistory = [] } = userInfo;
  
  // 性別を「男」か「女」で表示
  const displayGender = gender === '男性' ? '男' : gender === '女性' ? '女' : gender;
  
  // 生年月日のフォーマット
  const formattedBirthDate = formatDate(birthDate);
  
  // 年齢の計算
  const age = calculateAge(birthDate);

  return (
    <div className="mb-6">
      <table className="min-w-full border-collapse border border-gray-300">
        <tbody>
          {/* ユーザー基本情報 */}
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-gray-100 w-20">氏名</td>
            <td className="border border-gray-300 p-2">{lastName} {firstName} 様</td>
            <td className="border border-gray-300 p-2 font-bold bg-gray-100 w-20">性別</td>
            <td className="border border-gray-300 p-2">{displayGender}</td>
            <td className="border border-gray-300 p-2 font-bold bg-gray-100 w-20">生年月日</td>
            <td className="border border-gray-300 p-2">{formattedBirthDate}（{age}歳）</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-bold bg-gray-100">既往歴</td>
            <td className="border border-gray-300 p-2" colSpan={5}>
              {medicalHistory.length > 0 ? medicalHistory.join('、') : 'なし'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
