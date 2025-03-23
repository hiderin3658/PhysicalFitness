import { NextRequest, NextResponse } from 'next/server';
// DBヘルパー関数の代わりにadminClientを直接インポート
// import { getUserById, updateUser, deleteUser } from '../../../lib/db';
import { adminClient } from '../../../lib/db';

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
      // adminClientを直接使用してユーザー情報を取得
      const { data, error, status } = await adminClient
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('APIルート: Supabase操作結果 - ステータス:', status);
      
      if (error) {
        console.error('APIルート: ユーザー取得エラー:', error);
        console.error('APIルート: エラーコード:', error.code);
        console.error('APIルート: エラーメッセージ:', error.message);
        throw error;
      }
      
      if (!data) {
        console.log('APIルート: ユーザーが見つかりません - ID:', id);
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      
      // キー名の変換（スネークケース→キャメルケース）
      const user = {
        id: data.id,
        lastName: data.last_name,
        firstName: data.first_name,
        gender: data.gender,
        birthDate: data.birth_date,
        medicalHistory: data.medical_history || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      console.log('APIルート: ユーザーデータ応答準備完了');
      return NextResponse.json(user);
    } catch (dbError) {
      console.error('APIルート: ユーザー取得中のエラー:', dbError);
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
      // adminClientを直接使用してユーザー存在を確認
      const { data: existingUser, error: checkError } = await adminClient
        .from('users')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('APIルート: ユーザー存在確認エラー:', checkError);
        throw checkError;
      }
      
      if (!existingUser) {
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
      console.log('APIルート: ユーザー更新処理開始');
      
      // キー名の変換（キャメルケース→スネークケース）
      const dbUserData: any = {};
      
      if (data.lastName !== undefined) dbUserData.last_name = data.lastName;
      if (data.firstName !== undefined) dbUserData.first_name = data.firstName;
      if (data.gender !== undefined) dbUserData.gender = data.gender;
      if (data.birthDate !== undefined) dbUserData.birth_date = data.birthDate;
      if (data.medicalHistory !== undefined) dbUserData.medical_history = data.medicalHistory;
      
      // adminClientを直接使用してユーザー更新
      const { data: updateData, error: updateError } = await adminClient
        .from('users')
        .update(dbUserData)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('APIルート: ユーザー更新エラー:', updateError);
        throw updateError;
      }
      
      if (!updateData) {
        console.log('APIルート: 更新後のデータが見つかりませんでした - ID:', id);
        return NextResponse.json(
          { error: 'ユーザー更新後のデータが取得できませんでした' },
          { status: 500 }
        );
      }
      
      // キー名の変換（スネークケース→キャメルケース）
      const updatedUser = {
        id: updateData.id,
        lastName: updateData.last_name,
        firstName: updateData.first_name,
        gender: updateData.gender,
        birthDate: updateData.birth_date,
        medicalHistory: updateData.medical_history || [],
        createdAt: updateData.created_at,
        updatedAt: updateData.updated_at
      };
      
      console.log('APIルート: ユーザー更新成功:', JSON.stringify(updatedUser));
      return NextResponse.json(updatedUser);
    } catch (updateError) {
      console.error('APIルート: ユーザー更新中のエラー:', updateError);
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
      // adminClientを直接使用してユーザー存在を確認
      const { data: existingUser, error: checkError } = await adminClient
        .from('users')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('APIルート: ユーザー存在確認エラー:', checkError);
        throw checkError;
      }
      
      if (!existingUser) {
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
      console.log('APIルート: ユーザー削除処理開始');
      
      // adminClientを直接使用してユーザー削除
      const { error: deleteError, status } = await adminClient
        .from('users')
        .delete()
        .eq('id', id);
      
      console.log('APIルート: Supabase操作結果 - ステータス:', status);
      
      if (deleteError) {
        console.error('APIルート: ユーザー削除エラー:', deleteError);
        throw deleteError;
      }
      
      console.log('APIルート: ユーザー削除成功 - ID:', id);
      return new NextResponse(null, { status: 204 });
    } catch (deleteError) {
      console.error('APIルート: ユーザー削除中のエラー:', deleteError);
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
