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
    location: {
        city: {
            type: String,
            required: [true, 'City is required']
        },
        venue: {
            type: String,
            required: [true, 'Venue is required']
        },
        address: {
            type: String,
            required: [true, 'Address is required']
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