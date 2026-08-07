import { NextRequest, NextResponse } from 'next/server';
import { lookupStudents } from '@/src/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('nis') || '';
    const className = searchParams.get('class') || 'ALL';

    const results = await lookupStudents(query, className);

    // If query is specific for 1 student NIS, return top results or exact matches
    return NextResponse.json({
      success: true,
      total: results.length,
      students: results.slice(0, 50), // Limit max 50 for speed
    });
  } catch (err: any) {
    console.error('Error in student lookup route:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
