import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '../../lib/db';

// ビルド時の静的生成をスキップするための設定
export const dynamic = 'force-dynamic';

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
    console.log('APIルート: 受信したユーザーデータ:', data);
    
    // 必須フィールドの検証
    if (!data.lastName || !data.firstName || !data.gender || !data.birthDate) {
      console.log('APIルート: 必須フィールド不足:', { lastName: !!data.lastName, firstName: !!data.firstName, gender: !!data.gender, birthDate: !!data.birthDate });
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }
    
    console.log('APIルート: createUser呼び出し前');
    const newUser = await createUser({
      lastName: data.lastName,
      firstName: data.firstName,
      gender: data.gender,
      birthDate: data.birthDate,
      medicalHistory: data.medicalHistory || [],
    });
    
    console.log('APIルート: ユーザー作成成功:', newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('APIルート: ユーザー作成エラー:', error);
    return NextResponse.json(
      { error: `ユーザーの作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}
