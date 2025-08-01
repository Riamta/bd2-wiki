import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Code from '@/models/Code';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// GET - Fetch all codes
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const codes = await Code.find({});
    return NextResponse.json({
      success: true,
      codes,
    });
  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new code
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { code, reward, add_date, end_date } = body;

    if (!code || !reward || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Check if code already exists
    const existingCode = await Code.findOne({ code });
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Code already exists' },
        { status: 400 }
      );
    }

    // Create new code
    const newCode = new Code({
      code: code.trim().toUpperCase(),
      reward: reward.trim(),
      add_date: add_date || new Date().toISOString().split('T')[0],
      end_date: end_date,
      status: 'active',
    });

    await newCode.save();

    return NextResponse.json({
      success: true,
      code: newCode,
    });
  } catch (error) {
    console.error('Error adding code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update code
export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { originalCode, code, reward, add_date, end_date, status } = body;

    if (!originalCode || !code || !reward || !add_date || !end_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the code to update
    const codeToUpdate = await Code.findOne({ code: originalCode });

    if (!codeToUpdate) {
      return NextResponse.json(
        { success: false, error: 'Code not found' },
        { status: 404 }
      );
    }

    // Check if new code name conflicts with existing codes (except the current one)
    if (code !== originalCode) {
      const existingCode = await Code.findOne({ code });
      if (existingCode) {
        return NextResponse.json(
          { success: false, error: 'Code already exists' },
          { status: 400 }
        );
      }
    }

    // Update the code
    codeToUpdate.code = code.trim().toUpperCase();
    codeToUpdate.reward = reward.trim();
    codeToUpdate.add_date = add_date;
    codeToUpdate.end_date = end_date;
    codeToUpdate.status = status;

    await codeToUpdate.save();

    return NextResponse.json({
      success: true,
      code: codeToUpdate,
    });
  } catch (error) {
    console.error('Error updating code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete code
export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const codeToDelete = searchParams.get('code');

    if (!codeToDelete) {
      return NextResponse.json(
        { success: false, error: 'Code parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const deletedCode = await Code.findOneAndDelete({ code: codeToDelete });

    if (!deletedCode) {
      return NextResponse.json(
        { success: false, error: 'Code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
