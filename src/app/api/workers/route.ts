import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('Workers')
      .select('*')
      .order('이름', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, name, department, lineNumber } = body;

    console.log('Creating worker with data:', { employeeId, name, department, lineNumber });

    const { data, error } = await supabaseAdmin
      .from('Workers')
      .insert([
        {
          사번: employeeId,
          이름: name,
          부서: department || 'CNC',
          라인번호: lineNumber,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      );
    }

    console.log('Worker created successfully:', data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker', details: String(error) },
      { status: 500 }
    );
  }
}
