import { NextRequest, NextResponse } from 'next/server';
import { createMeasurement, getMeasurements } from '../../lib/db';

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
  try {
    const data = await request.json();
    
    // 必須フィールドの検証
    if (!data.userId || !data.measurementDate) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }
    
    const newMeasurement = await createMeasurement({
      userId: data.userId,
      measurementDate: data.measurementDate,
      height: parseFloat(data.height) || 0,
      weight: parseFloat(data.weight) || 0,
      tug: {
        first: parseFloat(data.tug?.first) || 0,
        second: parseFloat(data.tug?.second) || 0,
        best: parseFloat(data.tug?.best) || 0,
      },
      walkingSpeed: {
        first: parseFloat(data.walkingSpeed?.first) || 0,
        second: parseFloat(data.walkingSpeed?.second) || 0,
        best: parseFloat(data.walkingSpeed?.best) || 0,
      },
      fr: {
        first: parseFloat(data.fr?.first) || 0,
        second: parseFloat(data.fr?.second) || 0,
        best: parseFloat(data.fr?.best) || 0,
      },
      cs10: parseInt(data.cs10) || 0,
      bi: parseInt(data.bi) || 0,
      notes: data.notes || '',
    });
    
    return NextResponse.json(newMeasurement, { status: 201 });
  } catch (error) {
    console.error('Error creating measurement:', error);
    return NextResponse.json(
      { error: '測定データの登録に失敗しました' },
      { status: 500 }
    );
  }
}
