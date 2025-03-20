import { NextRequest, NextResponse } from 'next/server';
import { getMeasurementById, updateMeasurement, deleteMeasurement } from '../../../lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定の測定データの取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
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
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const measurement = await getMeasurementById(id);
    if (!measurement) {
      return NextResponse.json(
        { error: '測定データが見つかりません' },
        { status: 404 }
      );
    }
    
    const updatedMeasurement = await updateMeasurement(id, {
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const measurement = await getMeasurementById(id);
    if (!measurement) {
      return NextResponse.json(
        { error: '測定データが見つかりません' },
        { status: 404 }
      );
    }
    
    const success = await deleteMeasurement(id);
    
    if (success) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json(
        { error: '測定データの削除に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json(
      { error: '測定データの削除に失敗しました' },
      { status: 500 }
    );
  }
}
