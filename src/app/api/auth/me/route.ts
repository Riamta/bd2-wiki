import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify JWT token
    interface DecodedToken {
      userId: string;
      [key: string]: unknown;
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database and get user
    await dbConnect();
    const user = await User.findOne({ id: decoded.userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
