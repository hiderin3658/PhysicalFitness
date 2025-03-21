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
    // リクエストの詳細をログ
    console.log('APIルート: POST /api/users リクエスト受信');
    console.log('APIルート: リクエストヘッダー:', Object.fromEntries(request.headers));
    
    let data;
    try {
      data = await request.json();
      console.log('APIルート: 受信したユーザーデータ(生):', JSON.stringify(data));
    } catch (e) {
      console.error('APIルート: リクエストボディの解析に失敗:', e);
      return NextResponse.json(
        { error: 'リクエストデータの解析に失敗しました' },
        { status: 400 }
      );
    }
    
    // 必須フィールドの検証
    if (!data.lastName || !data.firstName || !data.gender || !data.birthDate) {
      console.log('APIルート: 必須フィールド不足:', { 
        lastName: data.lastName, 
        firstName: data.firstName, 
        gender: data.gender, 
        birthDate: data.birthDate,
        hasLastName: !!data.lastName, 
        hasFirstName: !!data.firstName, 
        hasGender: !!data.gender, 
        hasBirthDate: !!data.birthDate 
      });
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }
    
    console.log('APIルート: 検証通過、createUser呼び出し前');
    try {
      const newUser = await createUser({
        lastName: data.lastName,
        firstName: data.firstName,
        gender: data.gender,
        birthDate: data.birthDate,
        medicalHistory: data.medicalHistory || [],
      });
      
      console.log('APIルート: ユーザー作成成功:', JSON.stringify(newUser));
      return NextResponse.json(newUser, { status: 201 });
    } catch (dbError) {
      console.error('APIルート: データベース操作中のエラー:', dbError);
      console.error('APIルート: エラータイプ:', typeof dbError);
      console.error('APIルート: エラーJSON文字列:', JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
      
      if (dbError instanceof Error) {
        console.error('APIルート: エラーメッセージ:', dbError.message);
        console.error('APIルート: エラースタック:', dbError.stack);
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('APIルート: ユーザー作成エラー詳細:');
    console.error('APIルート: エラータイプ:', typeof error);
    console.error('APIルート: エラーJSON文字列:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    if (error instanceof Error) {
      console.error('APIルート: エラーメッセージ:', error.message);
      console.error('APIルート: エラースタック:', error.stack);
    }
    
    return NextResponse.json(
      { error: `ユーザーの作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}
