import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { employeeId, name, department, lineNumber } = body;

    const { data, error } = await supabaseAdmin
      .from('Workers')
      .update({
        사번: employeeId,
        이름: name,
        부서: department,
        라인번호: lineNumber,
      })
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { error: 'Failed to update worker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('Workers')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json(
      { error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}
