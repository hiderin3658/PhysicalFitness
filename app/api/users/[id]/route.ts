import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '../../../lib/db';

// ビルド時の静的生成をスキップするための設定
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// 特定ユーザーの取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('APIルート: GET /api/users/[id] - ID:', id);
    
    try {
      const user = await getUserById(id);
      console.log('APIルート: getUserById結果:', user ? 'ユーザー取得成功' : 'ユーザーなし');
      
      if (!user) {
        console.log('APIルート: ユーザーが見つかりません - ID:', id);
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      
      console.log('APIルート: ユーザーデータ応答準備完了');
      return NextResponse.json(user);
    } catch (dbError) {
      console.error('APIルート: getUserById関数からのエラー:', dbError);
      if (dbError instanceof Error) {
        console.error('APIルート: エラーメッセージ:', dbError.message);
        console.error('APIルート: エラースタック:', dbError.stack);
      }
      throw dbError; // エラーを再スローして外側のcatchブロックで処理
    }
  } catch (error) {
    console.error('APIルート: エラータイプ:', typeof error);
    if (error instanceof Error) {
      console.error('APIルート: エラーメッセージ:', error.message);
      console.error('APIルート: エラースタック:', error.stack);
    }
    
    return NextResponse.json(
      { error: `ユーザー情報の取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}

// ユーザー情報の更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('APIルート: PUT /api/users/[id] - ID:', id);
    
    let data;
    try {
      data = await request.json();
      console.log('APIルート: 受信したデータ:', JSON.stringify(data));
    } catch (e) {
      console.error('APIルート: リクエストボディの解析に失敗:', e);
      return NextResponse.json(
        { error: 'リクエストデータの解析に失敗しました' },
        { status: 400 }
      );
    }
    
    // ユーザーの存在確認
    try {
      const user = await getUserById(id);
      if (!user) {
        console.log('APIルート: 更新対象ユーザーが見つかりません - ID:', id);
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      console.log('APIルート: 更新対象ユーザーが存在します');
    } catch (checkError) {
      console.error('APIルート: ユーザー存在確認中のエラー:', checkError);
      throw checkError;
    }
    
    // ユーザーの更新
    try {
      console.log('APIルート: updateUser呼び出し開始');
      const updatedUser = await updateUser(id, {
        lastName: data.lastName,
        firstName: data.firstName,
        gender: data.gender,
        birthDate: data.birthDate,
        medicalHistory: data.medicalHistory,
      });
      
      console.log('APIルート: ユーザー更新成功:', updatedUser ? 'データあり' : 'データなし');
      return NextResponse.json(updatedUser);
    } catch (updateError) {
      console.error('APIルート: updateUser関数からのエラー:', updateError);
      if (updateError instanceof Error) {
        console.error('APIルート: エラーメッセージ:', updateError.message);
        console.error('APIルート: エラースタック:', updateError.stack);
      }
      throw updateError;
    }
  } catch (error) {
    console.error('APIルート: エラータイプ:', typeof error);
    if (error instanceof Error) {
      console.error('APIルート: エラーメッセージ:', error.message);
      console.error('APIルート: エラースタック:', error.stack);
    }
    
    return NextResponse.json(
      { error: `ユーザー情報の更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}

// ユーザーの削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('APIルート: DELETE /api/users/[id] - ID:', id);
    
    // ユーザーの存在確認
    try {
      const user = await getUserById(id);
      if (!user) {
        console.log('APIルート: 削除対象ユーザーが見つかりません - ID:', id);
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      console.log('APIルート: 削除対象ユーザーが存在します');
    } catch (checkError) {
      console.error('APIルート: ユーザー存在確認中のエラー:', checkError);
      throw checkError;
    }
    
    // ユーザーの削除
    try {
      console.log('APIルート: deleteUser呼び出し開始');
      const success = await deleteUser(id);
      
      console.log('APIルート: 削除結果:', success ? '成功' : '失敗');
      if (success) {
        return new NextResponse(null, { status: 204 });
      } else {
        return NextResponse.json(
          { error: 'ユーザーの削除に失敗しました' },
          { status: 500 }
        );
      }
    } catch (deleteError) {
      console.error('APIルート: deleteUser関数からのエラー:', deleteError);
      if (deleteError instanceof Error) {
        console.error('APIルート: エラーメッセージ:', deleteError.message);
        console.error('APIルート: エラースタック:', deleteError.stack);
      }
      throw deleteError;
    }
  } catch (error) {
    console.error('APIルート: エラータイプ:', typeof error);
    if (error instanceof Error) {
      console.error('APIルート: エラーメッセージ:', error.message);
      console.error('APIルート: エラースタック:', error.stack);
    }
    
    return NextResponse.json(
      { error: `ユーザーの削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` },
      { status: 500 }
    );
  }
}
