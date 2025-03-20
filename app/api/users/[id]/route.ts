import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '../../../lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定ユーザーの取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ユーザー情報の更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    const updatedUser = await updateUser(id, {
      lastName: data.lastName,
      firstName: data.firstName,
      gender: data.gender,
      birthDate: data.birthDate,
      medicalHistory: data.medicalHistory,
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// ユーザーの削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    const success = await deleteUser(id);
    
    if (success) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json(
        { error: 'ユーザーの削除に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
