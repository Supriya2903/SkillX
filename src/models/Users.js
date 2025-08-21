import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Profile Information
    bio: { type: String, default: '', maxLength: 500 },
    avatar: { type: String, default: '' },
    location: {
        city: { type: String, default: '' },
        country: { type: String, default: '' },
        timezone: { type: String, default: '' }
    },
    
    // Skills
    skillsOffered: [{
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
        category: { type: String, default: 'Other' },
        verified: { type: Boolean, default: false },
        yearsOfExperience: { type: Number, default: 0 },
        description: { type: String, default: '' }
    }],
    skillsNeeded: [{
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
        category: { type: String, default: 'Other' },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        description: { type: String, default: '' }
    }],
    
    // Social & Contact
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    
    // Preferences
    preferences: {
        availableForMentoring: { type: Boolean, default: true },
        preferredCommunication: { type: String, enum: ['Chat', 'Video', 'In-person', 'Email'], default: 'Chat' },
        timeZonePreference: { type: String, default: 'Flexible' },
        maxConnections: { type: Number, default: 10 }
    },
    
    // Stats & Gamification
    stats: {
        totalConnections: { type: Number, default: 0 },
        successfulExchanges: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        profileViews: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now }
    },
    
    // Badges & Achievements
    badges: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
        rarity: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary'], default: 'Common' }
    }],
    
    // Verification & Security
    isEmailVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    privacySettings: {
        showEmail: { type: Boolean, default: false },
        showLocation: { type: Boolean, default: true },
        showStats: { type: Boolean, default: true },
        allowMessages: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
});

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
    return this.name || 'Anonymous User';
});

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
    return this.stats.totalRatings > 0 ? (this.stats.rating / this.stats.totalRatings).toFixed(1) : 0;
});

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
    const requiredFields = [
        this.name,
        this.email,
        this.bio,
        this.skillsOffered.length > 0,
        this.skillsNeeded.length > 0
    ];
    
    const isComplete = requiredFields.every(field => {
        if (typeof field === 'boolean') return field;
        if (typeof field === 'string') return field.trim().length > 0;
        return !!field;
    });
    
    this.isProfileComplete = isComplete;
    return isComplete;
};

// Method to add a badge
userSchema.methods.addBadge = function(badgeData) {
    const existingBadge = this.badges.find(badge => badge.name === badgeData.name);
    if (!existingBadge) {
        this.badges.push(badgeData);
        return true;
    }
    return false;
};

// Pre-save middleware to update profile completion status
userSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.stats.lastActive = new Date();
        this.checkProfileCompletion();
    }
    next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
