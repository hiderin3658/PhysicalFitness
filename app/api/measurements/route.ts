import { NextRequest, NextResponse } from 'next/server';
import { createMeasurement, getMeasurements } from '../../lib/db';
import { MeasurementFormData } from '@/app/lib/types';

// ビルド時の静的生成をスキップするための設定
export const dynamic = 'force-dynamic';

// 環境変数の診断ログ
console.log('API Routes環境変数診断:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定あり' : '未設定');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定あり' : '未設定');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `設定あり (${process.env.SUPABASE_SERVICE_ROLE_KEY.length}文字)` : '未設定');

// 測定データ一覧の取得
export async function GET() {
  try {
    const measurements = await getMeasurements();
    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json(
      { error: '測定データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新規測定データの登録
export async function POST(request: NextRequest) {
  console.log('API: 測定データ作成リクエスト受信');
  
  try {
    // リクエストボディを取得
    const measurementData: MeasurementFormData = await request.json();
    
    console.log('API: 受信データ:', JSON.stringify(measurementData));
    
    if (!measurementData) {
      console.error('API: 空のリクエストボディ');
      return NextResponse.json(
        { error: '測定データが提供されていません' },
        { status: 400 }
      );
    }
    
    // 必須フィールドの検証
    if (!measurementData.userId || !measurementData.measurementDate) {
      console.error('API: 必須フィールドの欠落:', {
        userId: !!measurementData.userId,
        measurementDate: !!measurementData.measurementDate
      });
      return NextResponse.json(
        { error: 'ユーザーIDと測定日は必須です' },
        { status: 400 }
      );
    }
    
    console.log('API: サーバーサイドで測定データを保存します');
    console.log('API: 環境変数状態 - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '設定あり' : '未設定');
    
    // DBヘルパーを使用して測定データを作成（サーバーサイドでadminClientを使用）
    const newMeasurement = await createMeasurement(measurementData);
    
    console.log('API: 測定データの保存に成功しました:', JSON.stringify(newMeasurement));
    
    // 成功レスポンスを返す
    return NextResponse.json(
      { data: newMeasurement, message: '測定データが保存されました' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API: 測定データ保存エラー:', error);
    
    let errorMessage = '測定データの保存に失敗しました';
    let errorDetails = null;
    let statusCode = 500;
    
    // エラーの種類に基づいて適切なメッセージとステータスコードを設定
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack;
    }
    
    // Supabaseエラーの処理
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const supabaseError: any = error;
      
      switch (supabaseError.code) {
        case '23505':
          errorMessage = '同じ日付のデータがすでに存在します';
          statusCode = 409; // Conflict
          break;
        case '42501':
          errorMessage = 'データベースの権限が不足しています';
          statusCode = 403; // Forbidden
          break;
        case '42P01':
          errorMessage = 'データベーステーブルが存在しません';
          statusCode = 500;
          break;
        case '22P02':
        case 'PGRST301':
          errorMessage = '無効なデータ形式です';
          statusCode = 400; // Bad Request
          break;
      }
      
      errorDetails = {
        code: supabaseError.code,
        message: supabaseError.message,
        details: supabaseError.details
      };
    }
    
    // エラーレスポンスを返す
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
