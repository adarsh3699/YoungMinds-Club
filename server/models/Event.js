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
            required: false
        },
        venue: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        },
        onlineUrl: {
            type: String,
            required: false
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

// Pre-save hook for location validation
eventSchema.pre('save', function(next) {
    if (this.location && this.location.type) {
        if (this.location.type === 'offline') {
            if (!this.location.city || !this.location.venue || !this.location.address) {
                const error = new Error('City, venue, and address are required for offline events');
                error.name = 'ValidationError';
                return next(error);
            }
        } else if (this.location.type === 'online') {
            if (!this.location.onlineUrl) {
                const error = new Error('Online URL is required for online events');
                error.name = 'ValidationError';
                return next(error);
            }
        }
    }
    next();
});

// Pre-update hook for location validation
eventSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    
    // Check if location is being updated
    if (update.location || update['location.type'] || update['location.city'] || update['location.venue'] || update['location.address'] || update['location.onlineUrl']) {
        try {
            // Get the current document to check existing values
            const currentDoc = await this.model.findOne(this.getQuery());
            
            // Determine the location type (from update or existing document)
            const locationType = update['location.type'] || 
                                (update.location && update.location.type) || 
                                (currentDoc && currentDoc.location && currentDoc.location.type);
            
            if (locationType === 'offline') {
                const city = update['location.city'] || 
                           (update.location && update.location.city) || 
                           (currentDoc && currentDoc.location && currentDoc.location.city);
                           
                const venue = update['location.venue'] || 
                            (update.location && update.location.venue) || 
                            (currentDoc && currentDoc.location && currentDoc.location.venue);
                            
                const address = update['location.address'] || 
                              (update.location && update.location.address) || 
                              (currentDoc && currentDoc.location && currentDoc.location.address);
                
                if (!city || !venue || !address) {
                    const error = new Error('City, venue, and address are required for offline events');
                    error.name = 'ValidationError';
                    return next(error);
                }
            } else if (locationType === 'online') {
                const onlineUrl = update['location.onlineUrl'] || 
                                (update.location && update.location.onlineUrl) || 
                                (currentDoc && currentDoc.location && currentDoc.location.onlineUrl);
                
                if (!onlineUrl) {
                    const error = new Error('Online URL is required for online events');
                    error.name = 'ValidationError';
                    return next(error);
                }
            }
        } catch (err) {
            return next(err);
        }
    }
    next();
});

// Index for search functionality
eventSchema.index({ title: 'text', tags: 'text', 'location.city': 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 