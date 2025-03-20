import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '../../lib/db';

// ユーザー一覧の取得
export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 新規ユーザーの作成
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 必須フィールドの検証
    if (!data.lastName || !data.firstName || !data.gender || !data.birthDate) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }
    
    const newUser = await createUser({
      lastName: data.lastName,
      firstName: data.firstName,
      gender: data.gender,
      birthDate: data.birthDate,
      medicalHistory: data.medicalHistory || [],
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    );
  }
}
