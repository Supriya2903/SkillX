import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'skill_request', 'skill_offer', 'meeting_request', 'file', 'image'],
        default: 'text'
    },
    metadata: {
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        meetingDetails: {
            proposedTime: Date,
            duration: String,
            platform: String,
            agenda: String
        },
        fileUrl: String,
        fileName: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    originalContent: String, // Store original content if edited
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        createdAt: { type: Date, default: Date.now }
    }],
    threadId: {
        type: String, // For grouping related messages
        index: true
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ threadId: 1, createdAt: 1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

// Virtual for conversation participants (sorted)
MessageSchema.virtual('conversationId').get(function() {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    return participants.join('-');
});

// Method to mark message as read
MessageSchema.methods.markAsRead = function() {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to add reaction
MessageSchema.methods.addReaction = function(userId, emoji) {
    const existingReaction = this.reactions.find(r => 
        r.user.toString() === userId.toString() && r.emoji === emoji
    );
    
    if (existingReaction) {
        // Remove existing reaction (toggle)
        this.reactions = this.reactions.filter(r => r !== existingReaction);
    } else {
        // Remove other reactions from same user and add new one
        this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
        this.reactions.push({ user: userId, emoji });
    }
    
    return this.save();
};

// Static method to get conversation between two users
MessageSchema.statics.getConversation = function(userId1, userId2, limit = 50, skip = 0) {
    return this.find({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get user's conversations list
MessageSchema.statics.getUserConversations = function(userId) {
    return this.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose.Types.ObjectId(userId) },
                    { receiver: new mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                        '$receiver',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$isRead', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'participant'
            }
        },
        {
            $unwind: '$participant'
        },
        {
            $project: {
                participant: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    'stats.lastActive': 1
                },
                lastMessage: 1,
                unreadCount: 1
            }
        },
        {
            $sort: { 'lastMessage.createdAt': -1 }
        }
    ]);
};

// Static method to mark all messages as read in a conversation
MessageSchema.statics.markConversationAsRead = function(senderId, receiverId) {
    return this.updateMany(
        { sender: senderId, receiver: receiverId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
