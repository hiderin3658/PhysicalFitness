// モック用のインメモリデータベース
// 実際の実装ではUpstash Redisを使用する予定

interface User {
  id: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  medicalHistory: string[];
  createdAt: string;
  updatedAt: string;
}

interface Measurement {
  id: string;
  userId: string;
  measurementDate: string;
  height: number;
  weight: number;
  tug: {
    first: number;
    second: number;
    best: number;
  };
  walkingSpeed: {
    first: number;
    second: number;
    best: number;
  };
  fr: {
    first: number;
    second: number;
    best: number;
  };
  cs10: number;
  bi: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// モックデータ
let users: User[] = [
  {
    id: '1',
    lastName: '山田',
    firstName: '太郎',
    gender: '男性',
    birthDate: '1950-01-01',
    medicalHistory: ['高血圧', '糖尿病'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    lastName: '佐藤',
    firstName: '花子',
    gender: '女性',
    birthDate: '1955-05-05',
    medicalHistory: ['関節症'],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];

let measurements: Measurement[] = [
  {
    id: '1',
    userId: '1',
    measurementDate: '2024-05-04',
    height: 148.00,
    weight: 60.5,
    tug: {
      first: 9.1,
      second: 8.85,
      best: 8.85,
    },
    walkingSpeed: {
      first: 4.1,
      second: 4.22,
      best: 4.22,
    },
    fr: {
      first: 26,
      second: 28,
      best: 28,
    },
    cs10: 5,
    bi: 95,
    notes: 'CS10は6回目立位で終了',
    createdAt: '2024-05-04T00:00:00Z',
    updatedAt: '2024-05-04T00:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    measurementDate: '2024-08-03',
    height: 147.50,
    weight: 61.5,
    tug: {
      first: 8.9,
      second: 8.71,
      best: 8.71,
    },
    walkingSpeed: {
      first: 4.0,
      second: 4.13,
      best: 4.13,
    },
    fr: {
      first: 22,
      second: 23,
      best: 23,
    },
    cs10: 5,
    bi: 95,
    notes: 'CS10は6回目立位で終了',
    createdAt: '2024-08-03T00:00:00Z',
    updatedAt: '2024-08-03T00:00:00Z',
  },
  {
    id: '3',
    userId: '1',
    measurementDate: '2024-11-02',
    height: 147.50,
    weight: 62.0,
    tug: {
      first: 8.6,
      second: 8.43,
      best: 8.43,
    },
    walkingSpeed: {
      first: 3.9,
      second: 4.01,
      best: 4.01,
    },
    fr: {
      first: 21,
      second: 23,
      best: 23,
    },
    cs10: 5,
    bi: 95,
    notes: 'CS10は6回目立位で終了',
    createdAt: '2024-11-02T00:00:00Z',
    updatedAt: '2024-11-02T00:00:00Z',
  },
  {
    id: '4',
    userId: '1',
    measurementDate: '2025-02-08',
    height: 147.00,
    weight: 60.0,
    tug: {
      first: 9.2,
      second: 9.03,
      best: 9.03,
    },
    walkingSpeed: {
      first: 4.3,
      second: 4.42,
      best: 4.42,
    },
    fr: {
      first: 24,
      second: 25,
      best: 25,
    },
    cs10: 6,
    bi: 95,
    notes: 'CS10は6回目立位で終了',
    createdAt: '2025-02-08T00:00:00Z',
    updatedAt: '2025-02-08T00:00:00Z',
  },
];

// ユーザー関連の関数
export const getUsers = async (): Promise<User[]> => {
  return users;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return users.find(user => user.id === id) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  const now = new Date().toISOString();
  const newUser: User = {
    id: (users.length + 1).toString(),
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  
  return users[index];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length !== initialLength;
};

// 測定データ関連の関数
export const getMeasurements = async (): Promise<Measurement[]> => {
  return measurements;
};

export const getMeasurementById = async (id: string): Promise<Measurement | null> => {
  return measurements.find(measurement => measurement.id === id) || null;
};

export const getMeasurementsByUserId = async (userId: string): Promise<Measurement[]> => {
  return measurements.filter(measurement => measurement.userId === userId);
};

export const getLatestMeasurementsByUserId = async (userId: string, limit: number = 4): Promise<Measurement[]> => {
  return measurements
    .filter(measurement => measurement.userId === userId)
    .sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime())
    .slice(0, limit);
};

export const createMeasurement = async (measurementData: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Measurement> => {
  const now = new Date().toISOString();
  const newMeasurement: Measurement = {
    id: (measurements.length + 1).toString(),
    ...measurementData,
    createdAt: now,
    updatedAt: now,
  };
  
  measurements.push(newMeasurement);
  return newMeasurement;
};

export const updateMeasurement = async (id: string, measurementData: Partial<Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Measurement | null> => {
  const index = measurements.findIndex(measurement => measurement.id === id);
  if (index === -1) return null;
  
  measurements[index] = {
    ...measurements[index],
    ...measurementData,
    updatedAt: new Date().toISOString(),
  };
  
  return measurements[index];
};

export const deleteMeasurement = async (id: string): Promise<boolean> => {
  const initialLength = measurements.length;
  measurements = measurements.filter(measurement => measurement.id !== id);
  return measurements.length !== initialLength;
};
