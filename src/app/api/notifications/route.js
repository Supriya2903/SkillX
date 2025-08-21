import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import connectDB from '@/utils/db';
import Notification from '@/models/Notification';

export async function GET(request) {
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
    
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const skip = parseInt(url.searchParams.get('skip')) || 0;
    
    // Get notifications
    const notifications = await Notification.getUserNotifications(decoded.id, {
      unreadOnly,
      type,
      limit,
      skip
    });
    
    // Get unread count
    const unreadCount = await Notification.getUnreadCount(decoded.id);
    
    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
    
  } catch (error) {
    console.error('❌ Notifications API Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    
    const body = await request.json();
    const {
      recipient,
      title,
      message,
      type,
      data = {},
      priority = 'normal',
      actionUrl
    } = body;
    
    // Validate required fields
    if (!recipient || !title || !message || !type) {
      return NextResponse.json(
        { message: 'Missing required fields: recipient, title, message, type' },
        { status: 400 }
      );
    }
    
    // Create notification
    const notification = await Notification.createNotification({
      recipient,
      sender: decoded.id,
      title,
      message,
      type,
      data,
      priority,
      actionUrl
    });
    
    return NextResponse.json(
      { notification, message: 'Notification created successfully' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Create Notification Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
export async function PATCH(request) {
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
    
    // Mark all notifications as read for the user
    await Notification.markAllAsRead(decoded.id);
    
    return NextResponse.json({
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    console.error('❌ Mark All Read Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
