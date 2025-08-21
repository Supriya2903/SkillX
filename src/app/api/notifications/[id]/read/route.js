import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import connectDB from '@/utils/db';
import Notification from '@/models/Notification';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Find the notification and verify it belongs to the user
    const notification = await Notification.findOne({
      _id: id,
      recipient: decoded.id
    });
    
    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Mark as read
    await notification.markAsRead();
    
    return NextResponse.json({
      message: 'Notification marked as read',
      notification
    });
    
  } catch (error) {
    console.error('❌ Mark Notification Read Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
