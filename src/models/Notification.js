import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    message: {
        type: String,
        required: true,
        maxLength: 300
    },
    type: {
        type: String,
        enum: [
            'skill_match',
            'new_message',
            'skill_request',
            'meeting_request',
            'profile_view',
            'badge_earned',
            'connection_request',
            'skill_verified',
            'system_update',
            'welcome',
            'reminder'
        ],
        required: true
    },
    data: {
        // Flexible field for type-specific data
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        badgeId: String,
        url: String,
        actionRequired: Boolean,
        metadata: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    actionUrl: {
        type: String // URL to redirect when notification is clicked
    },
    expiresAt: {
        type: Date // For notifications that should auto-expire
    },
    isSystemNotification: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Static method to create notification
NotificationSchema.statics.createNotification = function(data) {
    const notification = new this(data);
    return notification.save();
};

// Static method to get user notifications
NotificationSchema.statics.getUserNotifications = function(userId, options = {}) {
    const { unreadOnly = false, type, limit = 20, skip = 0 } = options;
    
    const query = { recipient: userId };
    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;
    
    return this.find(query)
        .populate('sender', 'name avatar')
        .populate('data.skillId', 'title category')
        .populate('data.userId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = function(userId) {
    return this.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

// Static method to clean up old notifications
NotificationSchema.statics.cleanup = function(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    return this.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true,
        isSystemNotification: false
    });
};

// Pre-save middleware to set expiry for certain notification types
NotificationSchema.pre('save', function(next) {
    if (this.isNew && !this.expiresAt) {
        // Set expiry based on notification type
        const expiryDays = {
            'skill_match': 7,
            'profile_view': 3,
            'reminder': 1,
            'system_update': 30
        };
        
        if (expiryDays[this.type]) {
            this.expiresAt = new Date(Date.now() + expiryDays[this.type] * 24 * 60 * 60 * 1000);
        }
    }
    next();
});

// Notification templates for different types
NotificationSchema.statics.templates = {
    skill_match: {
        title: 'New Skill Match! 🎯',
        message: 'We found someone with skills that match your interests.'
    },
    new_message: {
        title: 'New Message 💬',
        message: 'You have a new message from {senderName}.'
    },
    skill_request: {
        title: 'Skill Exchange Request 🔄',
        message: '{senderName} wants to learn {skillName} from you.'
    },
    meeting_request: {
        title: 'Meeting Request 📅',
        message: '{senderName} has requested a meeting with you.'
    },
    profile_view: {
        title: 'Profile View 👀',
        message: '{senderName} viewed your profile.'
    },
    badge_earned: {
        title: 'Badge Earned! 🏆',
        message: 'Congratulations! You earned the "{badgeName}" badge.'
    },
    connection_request: {
        title: 'Connection Request 🤝',
        message: '{senderName} wants to connect with you.'
    },
    skill_verified: {
        title: 'Skill Verified ✅',
        message: 'Your {skillName} skill has been verified!'
    },
    welcome: {
        title: 'Welcome to SkillX! 🚀',
        message: 'Start your skill exchange journey by adding your first skills.'
    }
};

// Method to create notification from template
NotificationSchema.statics.createFromTemplate = function(type, recipientId, variables = {}, additionalData = {}) {
    const template = this.templates[type];
    if (!template) {
        throw new Error(`Notification template '${type}' not found`);
    }
    
    let message = template.message;
    Object.keys(variables).forEach(key => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    });
    
    const notificationData = {
        recipient: recipientId,
        type,
        title: template.title,
        message,
        ...additionalData
    };
    
    return this.createNotification(notificationData);
};

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
