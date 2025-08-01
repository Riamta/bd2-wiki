import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export async function GET() {
  try {
    await dbConnect();
    
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      banner: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, costume, start_date, end_date } = body;
    
    if (!name || !costume || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const banner = new Banner({
      name,
      costume,
      start_date,
      end_date,
      isActive: true
    });
    
    await banner.save();
    
    return NextResponse.json({
      success: true,
      banner
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { _id, name, costume, start_date, end_date, isActive } = body;
    
    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }
    
    const banner = await Banner.findByIdAndUpdate(
      _id,
      { name, costume, start_date, end_date, isActive },
      { new: true }
    );
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      banner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }
    
    const banner = await Banner.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}