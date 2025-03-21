// Supabase クライアント設定
import { createClient } from '@supabase/supabase-js';
import { User, Measurement, MeasurementFormData } from './types';

// 環境変数の設定（デフォルト値付き）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
// フロントエンド用の匿名キー
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
// サーバーサイド（APIルート）用のサービスロールキー
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 環境変数が設定されていない場合は警告ログを出力
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase環境変数が設定されていません。Vercelダッシュボードで環境変数を設定してください。');
}

// クライアント側で使用するSupabaseクライアント
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// サーバー側APIルートで使用するサービスロール権限付きクライアント
// サービスロールはRLSをバイパスできる特別な権限を持つ
const adminAuthEnabled = !!supabaseServiceKey;
const adminClient = adminAuthEnabled 
  ? createClient(supabaseUrl, supabaseServiceKey || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // フォールバックとして通常のクライアントを使用

console.log('Admin認証クライアント有効:', adminAuthEnabled);

// Supabaseクライアントの初期化完了

// ユーザー関連の関数
export const getUsers = async (): Promise<User[]> => {
  try {
    console.log('DB: getUsers関数開始');
    
    // adminClientを使用してRLSをバイパス
    const { data, error } = await adminClient
      .from('users')
      .select('*')
      .order('last_name', { ascending: true });
    
    // データベースアクセスエラーの場合は通知
    if (error) {
      console.error('Supabaseからのデータ取得エラー:', error.message);
      console.error('エラーコード:', error.code);
      console.error('エラー詳細:', error.details);
      // ユーザー体験を優先して空の配列を返す（テーブルが存在しない場合など）
      return [];
    }
    
    // データがnullまたは空の場合は空の配列を返す
    if (!data || data.length === 0) {
      return [];
    }
    
    // キー名の変換（スネークケース→キャメルケース）
    return data.map(item => ({
      id: item.id,
      lastName: item.last_name,
      firstName: item.first_name,
      gender: item.gender,
      birthDate: item.birth_date,
      medicalHistory: item.medical_history || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    // 予期しないエラーの場合もログに出力して空の配列を返す
    console.error('ユーザー一覧取得でエラーが発生しました:', error);
    return []; // エラーでもUIを表示できるように空の配列を返す
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  // キー名の変換（スネークケース→キャメルケース）
  return {
    id: data.id,
    lastName: data.last_name,
    firstName: data.first_name,
    gender: data.gender,
    birthDate: data.birth_date,
    medicalHistory: data.medical_history || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  console.log('DB: createUser関数開始', JSON.stringify(userData));
  
  // キー名の変換（キャメルケース→スネークケース）
  const dbUserData = {
    last_name: userData.lastName,
    first_name: userData.firstName,
    gender: userData.gender,
    birth_date: userData.birthDate,
    medical_history: userData.medicalHistory || []
  };
  
  console.log('DB: Supabaseへ送信するデータ:', JSON.stringify(dbUserData));
  console.log('DB: Supabase URL:', supabaseUrl);
  console.log('DB: Admin認証クライアント使用:', adminAuthEnabled);
  
  try {
    console.log('DB: Supabase insert操作開始');
    
    // 管理者クライアントを使用してRLSをバイパス
    const { data, error, status } = await adminClient
      .from('users')
      .insert([dbUserData])
      .select()
      .single();
    
    console.log('DB: Supabase操作結果 - ステータス:', status);
    
    if (error) {
      console.error('DB: ユーザーデータ挿入エラー:', error);
      console.error('DB: エラーコード:', error.code);
      console.error('DB: エラーメッセージ:', error.message);
      console.error('DB: エラー詳細:', error.details);
      console.error('DB: エラーヒント:', error.hint);
      throw error;
    }
    
    console.log('DB: データベース応答:', JSON.stringify(data));
    
    if (!data) {
      console.error('DB: データなし');
      throw new Error('データ挿入に成功しましたが、レコードが返されませんでした');
    }
    
    const result = {
      id: data.id,
      lastName: data.last_name,
      firstName: data.first_name,
      gender: data.gender,
      birthDate: data.birth_date,
      medicalHistory: data.medical_history || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('DB: 変換後の結果オブジェクト:', JSON.stringify(result));
    return result;
  } catch (e) {
    console.error('DB: 例外発生:', e);
    if (e instanceof Error) {
      console.error('DB: 例外メッセージ:', e.message);
      console.error('DB: 例外スタック:', e.stack);
    }
    throw e;
  }
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> => {
  // キー名の変換（キャメルケース→スネークケース）
  const dbUserData: any = {};
  
  if (userData.lastName !== undefined) dbUserData.last_name = userData.lastName;
  if (userData.firstName !== undefined) dbUserData.first_name = userData.firstName;
  if (userData.gender !== undefined) dbUserData.gender = userData.gender;
  if (userData.birthDate !== undefined) dbUserData.birth_date = userData.birthDate;
  if (userData.medicalHistory !== undefined) dbUserData.medical_history = userData.medicalHistory;
  
  const { data, error } = await supabase
    .from('users')
    .update(dbUserData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  // キー名の変換（スネークケース→キャメルケース）
  return {
    id: data.id,
    lastName: data.last_name,
    firstName: data.first_name,
    gender: data.gender,
    birthDate: data.birth_date,
    medicalHistory: data.medical_history || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// 測定データ関連の関数
export const getMeasurements = async (): Promise<Measurement[]> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .order('measurement_date', { ascending: false });
  
  if (error) throw error;
  
  // キー名の変換（スネークケース→キャメルケース）
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    measurementDate: item.measurement_date,
    height: item.height,
    weight: item.weight,
    tug: item.tug,
    walkingSpeed: item.walking_speed,
    fr: item.fr,
    cs10: item.cs10,
    bi: item.bi,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const getMeasurementById = async (id: string): Promise<Measurement | null> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  // キー名の変換（スネークケース→キャメルケース）
  return {
    id: data.id,
    userId: data.user_id,
    measurementDate: data.measurement_date,
    height: data.height,
    weight: data.weight,
    tug: data.tug,
    walkingSpeed: data.walking_speed,
    fr: data.fr,
    cs10: data.cs10,
    bi: data.bi,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const getMeasurementsByUserId = async (userId: string): Promise<Measurement[]> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false });
  
  if (error) throw error;
  
  // キー名の変換（スネークケース→キャメルケース）
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    measurementDate: item.measurement_date,
    height: item.height,
    weight: item.weight,
    tug: item.tug,
    walkingSpeed: item.walking_speed,
    fr: item.fr,
    cs10: item.cs10,
    bi: item.bi,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const getLatestMeasurementsByUserId = async (userId: string, limit: number = 4): Promise<Measurement[]> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  // キー名の変換（スネークケース→キャメルケース）
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    measurementDate: item.measurement_date,
    height: item.height,
    weight: item.weight,
    tug: item.tug,
    walkingSpeed: item.walking_speed,
    fr: item.fr,
    cs10: item.cs10,
    bi: item.bi,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const createMeasurement = async (measurementData: MeasurementFormData): Promise<Measurement> => {
  // キー名の変換（キャメルケース→スネークケース）
  const dbMeasurementData = {
    user_id: measurementData.userId,
    measurement_date: measurementData.measurementDate,
    height: Number(measurementData.height) || 0,
    weight: Number(measurementData.weight) || 0,
    tug: {
      first: Number(measurementData.tug.first) || 0,
      second: Number(measurementData.tug.second) || 0,
      best: Number(measurementData.tug.best) || Math.min(Number(measurementData.tug.first) || 0, Number(measurementData.tug.second) || 0)
    },
    walking_speed: {
      first: Number(measurementData.walkingSpeed.first) || 0,
      second: Number(measurementData.walkingSpeed.second) || 0,
      best: Number(measurementData.walkingSpeed.best) || Math.min(Number(measurementData.walkingSpeed.first) || 0, Number(measurementData.walkingSpeed.second) || 0)
    },
    fr: {
      first: Number(measurementData.fr.first) || 0,
      second: Number(measurementData.fr.second) || 0,
      best: Number(measurementData.fr.best) || Math.max(Number(measurementData.fr.first) || 0, Number(measurementData.fr.second) || 0)
    },
    cs10: Number(measurementData.cs10) || 0,
    bi: Number(measurementData.bi) || 0,
    notes: measurementData.notes || ''
  };
  
  const { data, error } = await supabase
    .from('measurements')
    .insert([dbMeasurementData])
    .select()
    .single();
  
  if (error) throw error;
  
  // キー名の変換（スネークケース→キャメルケース）
  return {
    id: data.id,
    userId: data.user_id,
    measurementDate: data.measurement_date,
    height: data.height,
    weight: data.weight,
    tug: data.tug,
    walkingSpeed: data.walking_speed,
    fr: data.fr,
    cs10: data.cs10,
    bi: data.bi,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const updateMeasurement = async (id: string, measurementData: Partial<Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Measurement | null> => {
  // キー名の変換（キャメルケース→スネークケース）
  const dbMeasurementData: any = {};
  
  if (measurementData.userId !== undefined) dbMeasurementData.user_id = measurementData.userId;
  if (measurementData.measurementDate !== undefined) dbMeasurementData.measurement_date = measurementData.measurementDate;
  if (measurementData.height !== undefined) dbMeasurementData.height = measurementData.height;
  if (measurementData.weight !== undefined) dbMeasurementData.weight = measurementData.weight;
  if (measurementData.tug !== undefined) dbMeasurementData.tug = measurementData.tug;
  if (measurementData.walkingSpeed !== undefined) dbMeasurementData.walking_speed = measurementData.walkingSpeed;
  if (measurementData.fr !== undefined) dbMeasurementData.fr = measurementData.fr;
  if (measurementData.cs10 !== undefined) dbMeasurementData.cs10 = measurementData.cs10;
  if (measurementData.bi !== undefined) dbMeasurementData.bi = measurementData.bi;
  if (measurementData.notes !== undefined) dbMeasurementData.notes = measurementData.notes;
  
  const { data, error } = await supabase
    .from('measurements')
    .update(dbMeasurementData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  // キー名の変換（スネークケース→キャメルケース）
  return {
    id: data.id,
    userId: data.user_id,
    measurementDate: data.measurement_date,
    height: data.height,
    weight: data.weight,
    tug: data.tug,
    walkingSpeed: data.walking_speed,
    fr: data.fr,
    cs10: data.cs10,
    bi: data.bi,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteMeasurement = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};