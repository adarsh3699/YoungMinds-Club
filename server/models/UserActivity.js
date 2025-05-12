const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    xp: {
        type: Number,
        default: 0
    },
    badge: {
        type: String,
        enum: ['Newbie', 'Regular', 'Champ', 'Veteran', 'Master'],
        default: 'Newbie'
    },
    lastEventDate: {
        type: Date,
        default: null
    },
    streakCount: {
        type: Number,
        default: 0
    },
    savedEvents: [{
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],
    registeredEvents: [{
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        attended: {
            type: Boolean,
            default: false
        },
        feedback: {
            given: {
                type: Boolean,
                default: false
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                trim: true
            },
            givenAt: {
                type: Date
            }
        }
    }]
}, {
    timestamps: true
});

// Method to add XP points
userActivitySchema.methods.addXP = async function(points) {
    this.xp += points;
    
    // Update badge based on XP thresholds
    if (this.xp >= 500) {
        this.badge = 'Master';
    } else if (this.xp >= 300) {
        this.badge = 'Veteran';
    } else if (this.xp >= 150) {
        this.badge = 'Champ';
    } else if (this.xp >= 50) {
        this.badge = 'Regular';
    } else {
        this.badge = 'Newbie';
    }
    
    await this.save();
    return this;
};

// Method to check and update streak
userActivitySchema.methods.updateStreak = async function(eventDate) {
    const currentDate = new Date(eventDate);
    const lastDate = this.lastEventDate;
    
    // Calculate difference in days
    const diffDays = lastDate ? Math.floor((currentDate - new Date(lastDate)) / (1000 * 60 * 60 * 24)) : null;
    
    // Check if this is a weekend attendance
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
    
    if (isWeekend) {
        // If last event was on previous weekend, increment streak
        if (diffDays <= 14 && diffDays >= 1) {
            this.streakCount += 1;
            
            // If streak is a multiple of 3, give bonus XP
            if (this.streakCount % 3 === 0) {
                await this.addXP(15); // Bonus XP for maintaining streak
            }
        } else if (diffDays > 14) {
            // Reset streak if more than 2 weeks passed
            this.streakCount = 1;
        }
        
        this.lastEventDate = currentDate;
        await this.save();
    }
    
    return this;
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity; 