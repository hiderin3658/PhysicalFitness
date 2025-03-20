import { NextRequest, NextResponse } from 'next/server';
import { getMeasurementById, updateMeasurement, deleteMeasurement } from '@/app/lib/db';

// 特定の測定データの取得
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const measurement = await getMeasurementById(id);
    
    if (!measurement) {
      return NextResponse.json(
        { error: '測定データが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(measurement);
  } catch (error) {
    console.error('Error fetching measurement:', error);
    return NextResponse.json(
      { error: '測定データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 測定データの更新
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await request.json();
    
    if (!data) {
      return NextResponse.json(
        { error: 'リクエストボディが見つかりません' },
        { status: 400 }
      );
    }
    
    const measurement = await getMeasurementById(id);
    if (!measurement) {
      return NextResponse.json(
        { error: '測定データが見つかりません' },
        { status: 404 }
      );
    }
    
    const updatedMeasurement = await updateMeasurement(id, data);
    return NextResponse.json(updatedMeasurement);
  } catch (error) {
    console.error('Error updating measurement:', error);
    return NextResponse.json(
      { error: '測定データの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 測定データの削除
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    
    const measurement = await getMeasurementById(id);
    if (!measurement) {
      return NextResponse.json(
        { error: '測定データが見つかりません' },
        { status: 404 }
      );
    }
    
    await deleteMeasurement(id);
    return NextResponse.json({ message: '測定データが削除されました' });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json(
      { error: '測定データの削除に失敗しました' },
      { status: 500 }
    );
  }
}
