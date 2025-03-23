interface User {
  id: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  medicalHistory: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface MeasurementFormData {
  userId: string;
  measurementDate: string;
  height: number | string;
  weight: number | string;
  tug: {
    first: number | string;
    second: number | string;
    best?: number;
  };
  walkingSpeed: {
    first: number | string;
    second: number | string;
    best?: number;
  };
  fr: {
    first: number | string;
    second: number | string;
    best?: number;
  };
  cs10: number | string;
  bi?: number | string;
  notes: string;
  name?: string; // MeasurementFormコンポーネントの互換性のため
}

interface Measurement {
  id: string;
  userId: string;
  measurementDate: string;
  height?: number;
  weight?: number;
  bmi?: number;
  grip?: number;
  walkingSpeed?: number | {
    first: number;
    second: number;
    best: number;
  };
  oneLegStanding?: number;
  functionalReach?: number;
  tug?: {
    first: number;
    second: number;
    best: number;
  };
  fr?: {
    first: number;
    second: number;
    best: number;
  };
  cs10?: number;
  bi?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type { User, MeasurementFormData, Measurement };
