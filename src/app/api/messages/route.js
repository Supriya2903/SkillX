import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import connectDB from '@/utils/db';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import Users from '@/models/Users';

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
    const otherUserId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const skip = parseInt(url.searchParams.get('skip')) || 0;
    
    if (otherUserId) {
      // Get conversation with specific user
      const messages = await Message.getConversation(decoded.id, otherUserId, limit, skip);
      // Also fetch participant info so the client can show them in the sidebar even if no history exists
      const participant = await Users.findById(otherUserId).select('name avatar stats.lastActive').lean();
      return NextResponse.json({ messages, participant });
    } else {
      // Get all conversations for the user
      const conversations = await Message.getUserConversations(decoded.id);
      return NextResponse.json({ conversations });
    }
    
  } catch (error) {
    console.error('❌ Messages API Error:', error);
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
      receiverId,
      content,
      messageType = 'text',
      metadata = {},
      replyTo
    } = body;
    
    // Validate required fields
    if (!receiverId || !content) {
      return NextResponse.json(
        { message: 'Missing required fields: receiverId, content' },
        { status: 400 }
      );
    }
    
    // Prevent sending message to self
    if (receiverId === decoded.id) {
      return NextResponse.json(
        { message: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }
    
    // Create message
    const message = new Message({
      sender: decoded.id,
      receiver: receiverId,
      content,
      messageType,
      metadata,
      replyTo,
      threadId: `${[decoded.id, receiverId].sort().join('-')}-${Date.now()}`
    });
    
    await message.save();
    
    // Populate sender and receiver info
    await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' }
    ]);
    
    // Create notification for receiver
    try {
      await Notification.createFromTemplate(
        'new_message',
        receiverId,
        { senderName: message.sender.name },
        {
          sender: decoded.id,
          data: {
            messageId: message._id,
            userId: decoded.id
          },
          actionUrl: `/messages?user=${decoded.id}`,
          priority: 'normal'
        }
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }
    
    return NextResponse.json(
      { message, success: 'Message sent successfully' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Send Message Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Mark messages as read
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
    
    const body = await request.json();
    const { senderId } = body;
    
    if (!senderId) {
      return NextResponse.json(
        { message: 'senderId is required' },
        { status: 400 }
      );
    }
    
    // Mark all messages from sender as read
    await Message.markConversationAsRead(senderId, decoded.id);
    
    return NextResponse.json({
      message: 'Messages marked as read'
    });
    
  } catch (error) {
    console.error('❌ Mark Messages Read Error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
