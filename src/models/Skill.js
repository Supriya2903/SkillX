import mongoose from "mongoose";

// Predefined skill categories
const SKILL_CATEGORIES = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Graphic Design',
    'Digital Marketing', 'Content Writing', 'Photography', 'Video Editing', 'Music Production',
    'Language Learning', 'Business', 'Finance', 'Project Management', 'Sales',
    'Communication', 'Leadership', 'Teaching', 'Research', 'Other'
];

const SkillSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: false,
        maxLength: 1000
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
        required: true,
    },
    category: {
        type: String,
        enum: SKILL_CATEGORIES,
        default: 'Other',
        required: true
    },
    tags: [{
        type: String,
        maxLength: 50
    }],
    
    // Portfolio and Evidence
    portfolio: {
        projects: [{
            name: { type: String, required: true },
            description: { type: String },
            url: { type: String },
            imageUrl: { type: String },
            technologies: [String],
            completedAt: { type: Date }
        }],
        certifications: [{
            name: { type: String, required: true },
            issuer: { type: String },
            url: { type: String },
            completedAt: { type: Date },
            expiresAt: { type: Date }
        }],
        experience: {
            years: { type: Number, default: 0 },
            description: { type: String },
            companies: [String]
        }
    },
    
    // Skill Offering/Learning Details
    skillType: {
        type: String,
        enum: ['Offering', 'Learning'],
        required: true
    },
    availability: {
        hoursPerWeek: { type: Number, default: 0 },
        preferredTime: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Flexible'], default: 'Flexible' },
        timezone: { type: String, default: 'UTC' }
    },
    
    // Social Proof and Verification
    isVerified: { type: Boolean, default: false },
    verificationDetails: {
        method: { type: String }, // 'Certificate', 'Portfolio', 'Reference', 'Test'
        verifiedAt: { type: Date },
        verifiedBy: { type: String }
    },
    
    // Engagement Stats
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        connections: { type: Number, default: 0 },
        successfulExchanges: { type: Number, default: 0 }
    },
    
    // Learning/Teaching Preferences (for matching)
    preferences: {
        teachingStyle: { type: String, enum: ['Hands-on', 'Theory-based', 'Mixed', 'Project-based'], default: 'Mixed' },
        learningStyle: { type: String, enum: ['Visual', 'Auditory', 'Reading', 'Kinesthetic', 'Mixed'], default: 'Mixed' },
        sessionDuration: { type: String, enum: ['30min', '1hour', '2hours', 'Flexible'], default: 'Flexible' },
        maxGroupSize: { type: Number, default: 1 }
    },
    
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

// Indexes for better query performance
SkillSchema.index({ category: 1, level: 1 });
SkillSchema.index({ createdBy: 1, skillType: 1 });
SkillSchema.index({ tags: 1 });
SkillSchema.index({ 'stats.views': -1 });

// Virtual for skill popularity score
SkillSchema.virtual('popularityScore').get(function() {
    const { views, likes, connections } = this.stats;
    return (views * 0.1) + (likes * 0.3) + (connections * 0.6);
});

// Method to increment view count
SkillSchema.methods.incrementViews = function() {
    this.stats.views += 1;
    return this.save();
};

// Method to add like
SkillSchema.methods.addLike = function() {
    this.stats.likes += 1;
    return this.save();
};

// Static method to get skills by category
SkillSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ category, isActive: true })
        .populate('createdBy', 'name avatar stats.rating')
        .sort({ 'stats.views': -1 })
        .limit(limit);
};

// Static method to search skills
SkillSchema.statics.searchSkills = function(query, options = {}) {
    const { category, level, skillType, limit = 20 } = options;
    
    const searchQuery = {
        isActive: true,
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ]
    };
    
    if (category) searchQuery.category = category;
    if (level) searchQuery.level = level;
    if (skillType) searchQuery.skillType = skillType;
    
    return this.find(searchQuery)
        .populate('createdBy', 'name avatar stats.rating location.city')
        .sort({ 'stats.views': -1 })
        .limit(limit);
};

// Pre-save middleware
SkillSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdated = new Date();
    }
    next();
});

export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
export { SKILL_CATEGORIES };
