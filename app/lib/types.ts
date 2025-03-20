'use client';

interface User {
  id: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  medicalHistory: string[];
}

interface MeasurementFormData {
  name: string;
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
}

export type { User, MeasurementFormData, Measurement };
