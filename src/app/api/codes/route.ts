import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Code from '@/models/Code';

export async function GET() {
  try {
    await dbConnect();
    const codes = await Code.find({});
    return NextResponse.json({ success: true, codes });
  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}