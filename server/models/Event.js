const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },
    shortDescription: {
        type: String, 
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    poster: {
        type: String,
        required: [true, 'Event poster image URL is required']
    },
    type: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['Conference', 'Workshop', 'Meetup', 'Hackathon', 'MUN', 'Concert', 'Other']
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Technology', 'Business', 'Education', 'Arts', 'Science', 'Music', 'Sports', 'Other']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    endDate: {
        type: Date
    },
    location: {
        type: {
            type: String,
            enum: ['online', 'offline'],
            required: [true, 'Location type is required']
        },
        city: {
            type: String,
            required: function() { return this.location.type === 'offline'; }
        },
        venue: {
            type: String,
            required: function() { return this.location.type === 'offline'; }
        },
        address: {
            type: String,
            required: function() { return this.location.type === 'offline'; }
        },
        onlineUrl: {
            type: String,
            required: function() { return this.location.type === 'online'; }
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Event organizer is required']
    },
    registrationCount: {
        type: Number,
        default: 0
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required']
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagReason: {
        type: String
    },
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        uniqueVisitors: {
            type: Number,
            default: 0
        },
        registrationsDaily: [{
            date: {
                type: Date
            },
            count: {
                type: Number,
                default: 0
            }
        }]
    },
    registrationDeadline: {
        type: Date
    },
    price: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for search functionality
eventSchema.index({ title: 'text', tags: 'text', 'location.city': 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 