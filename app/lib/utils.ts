// 日付のフォーマット
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

// BMIの計算
export const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

// 年齢の計算
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

// IDの生成
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 現在日時の取得
export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

// 測定値の最良値を計算
export const calculateBestValue = (first: number, second: number, isLowerBetter: boolean = false): number => {
  if (isNaN(first) && isNaN(second)) return 0;
  if (isNaN(first)) return second;
  if (isNaN(second)) return first;
  
  return isLowerBetter
    ? Math.min(first, second)
    : Math.max(first, second);
};
