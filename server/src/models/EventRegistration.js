const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    status: {
        type: String,
        enum: ['registered', 'cancelled', 'attended'],
        default: 'registered'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    checkIn: {
        checkedIn: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        }
    },
    feedback: {
        submitted: {
            type: Boolean,
            default: false
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String
        },
        submittedAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Prevent duplicate registrations
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

module.exports = EventRegistration; 