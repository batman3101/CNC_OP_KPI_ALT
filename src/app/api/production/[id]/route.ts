import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('Production')
      .update({
        날짜: body.date,
        작업자: body.worker,
        라인번호: body.lineNumber,
        모델차수: body.model,
        목표수량: body.targetQuantity,
        생산수량: body.productionQuantity,
        불량수량: body.defectQuantity,
        특이사항: body.note || '',
      })
      .eq('id', params.id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating production:', error);
    return NextResponse.json(
      { error: 'Failed to update production record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('Production')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Production record deleted successfully' });
  } catch (error) {
    console.error('Error deleting production:', error);
    return NextResponse.json(
      { error: 'Failed to delete production record' },
      { status: 500 }
    );
  }
}
