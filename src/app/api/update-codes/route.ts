import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Code from '@/models/Code';

export async function POST(request: NextRequest) {
  try {
    const { updatedCodes } = await request.json();
    
    if (!Array.isArray(updatedCodes)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    
    // Update each code in the database
    for (const updatedCode of updatedCodes) {
      await Code.findOneAndUpdate(
        { code: updatedCode.code },
        { status: updatedCode.status },
        { new: true }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating codes:', error);
    return NextResponse.json(
      { error: 'Failed to update codes' },
      { status: 500 }
    );
  }
}