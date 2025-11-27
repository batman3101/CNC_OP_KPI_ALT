import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const worker = searchParams.get('worker');
    const line = searchParams.get('line');
    const model = searchParams.get('model');

    let query = supabase.from('Production').select('*');

    if (startDate) {
      query = query.gte('날짜', startDate);
    }
    if (endDate) {
      query = query.lte('날짜', endDate);
    }
    if (worker) {
      query = query.eq('작업자', worker);
    }
    if (line) {
      query = query.eq('라인번호', line);
    }
    if (model) {
      query = query.eq('모델차수', model);
    }

    query = query.order('날짜', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching production:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('Production')
      .insert([
        {
          날짜: body.date,
          작업자: body.worker,
          라인번호: body.lineNumber,
          모델차수: body.model,
          목표수량: body.targetQuantity,
          생산수량: body.productionQuantity,
          불량수량: body.defectQuantity,
          특이사항: body.note || '',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating production:', error);
    return NextResponse.json(
      { error: 'Failed to create production record' },
      { status: 500 }
    );
  }
}
