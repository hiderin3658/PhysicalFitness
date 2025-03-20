import { NextRequest, NextResponse } from 'next/server';
import { getMeasurementsByUserId, getLatestMeasurementsByUserId } from '../../../../lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定ユーザーの全測定データ取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get('latest');
    
    let measurements;
    
    if (latest === 'true') {
      // 最新の測定データを取得（デフォルトで4件）
      const limit = parseInt(searchParams.get('limit') || '4');
      measurements = await getLatestMeasurementsByUserId(id, limit);
    } else {
      // すべての測定データを取得
      measurements = await getMeasurementsByUserId(id);
    }
    
    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error fetching user measurements:', error);
    return NextResponse.json(
      { error: 'ユーザーの測定データ取得に失敗しました' },
      { status: 500 }
    );
  }
}
