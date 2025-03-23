import { NextRequest, NextResponse } from 'next/server';
// getMeasurementsByUserIdをインポートしない
// import { getMeasurementsByUserId, getLatestMeasurementsByUserId } from '../../../../lib/db';
// adminClientを直接インポート
import { adminClient } from '../../../../lib/db';

// ビルド時の静的生成をスキップするための設定
export const dynamic = 'force-dynamic';
export const revalidate = 0; // キャッシュを無効化

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定ユーザーの全測定データ取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`API: ユーザーID ${params.id} の測定データ取得リクエスト受信 (${timestamp})`);
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get('latest');
    
    let measurements;
    
    if (latest === 'true') {
      // 最新の測定データを取得（デフォルトで4件）
      const limit = parseInt(searchParams.get('limit') || '4');
      console.log(`API: 最新${limit}件の測定データを取得します`);
      
      // adminClientを直接使用して最新データを取得
      const { data, error } = await adminClient
        .from('measurements')
        .select('id, measurement_date, height, weight, tug, walking_speed, fr, cs10, bi, user_id, created_at, updated_at')
        .eq('user_id', id)
        .order('measurement_date', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('API: 最新測定データ取得エラー:', error);
        throw error;
      }
      
      measurements = data || [];
    } else {
      // すべての測定データを取得
      console.log(`API: すべての測定データを取得します`);
      
      // adminClientを直接使用してすべてのデータを取得
      const { data, error } = await adminClient
        .from('measurements')
        .select('id, measurement_date, height, weight, tug, walking_speed, fr, cs10, bi, user_id, created_at, updated_at')
        .eq('user_id', id)
        .order('measurement_date', { ascending: false });
        
      if (error) {
        console.error('API: 測定データ取得エラー:', error);
        throw error;
      }
      
      measurements = data || [];
    }
    
    // キー名の変換（スネークケース→キャメルケース）
    const formattedMeasurements = measurements.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      measurementDate: item.measurement_date,
      height: item.height,
      weight: item.weight,
      tug: item.tug,
      walkingSpeed: item.walking_speed,
      fr: item.fr,
      cs10: item.cs10,
      bi: item.bi !== null && item.bi !== undefined ? item.bi : 0,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    
    // 測定データのBI値をログ出力
    if (Array.isArray(formattedMeasurements)) {
      formattedMeasurements.forEach(measurement => {
        console.log(`API: 測定ID: ${measurement.id}, BI値: ${measurement.bi}, 日付: ${measurement.measurementDate}`);
        // 他の重要なフィールドもログ出力
        const walkingSpeedText = typeof measurement.walkingSpeed === 'object' 
          ? JSON.stringify(measurement.walkingSpeed)
          : measurement.walkingSpeed;
        const tugText = measurement.tug ? JSON.stringify(measurement.tug) : 'undefined';
        const frText = measurement.fr ? JSON.stringify(measurement.fr) : 'undefined';
        
        console.log(`API: 詳細データ - walkingSpeed: ${walkingSpeedText}, tug: ${tugText}, fr: ${frText}, cs10: ${measurement.cs10 || 'undefined'}`);
      });
    }
    
    console.log(`API: ${formattedMeasurements.length}件の測定データを返します (${new Date().toISOString()})`);
    
    // キャッシュを確実に無効化するためのヘッダーを追加
    return new NextResponse(JSON.stringify(formattedMeasurements), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Response-Time': new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('API: ユーザー測定データ取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'ユーザーの測定データ取得に失敗しました',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
