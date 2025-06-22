const mongoose = require('mongoose');

const internshipApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: [true, 'Internship is required']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    coverLetter: {
        type: String,
        trim: true
    },
    resume: {
        type: String, // URL to uploaded resume
        required: false
    },
    portfolio: {
        type: String, // URL to portfolio
        required: false
    },
    additionalInfo: {
        type: String,
        trim: true
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNotes: {
        type: String,
        trim: true
    },
    feedback: {
        type: String,
        trim: true
    },
    // Track XP awarded for this application
    xpAwarded: {
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

// Compound index to ensure a user can only apply once to the same internship
internshipApplicationSchema.index({ user: 1, internship: 1 }, { unique: true });

// Index for better query performance
internshipApplicationSchema.index({ internship: 1, status: 1 });
internshipApplicationSchema.index({ user: 1, appliedAt: -1 });
internshipApplicationSchema.index({ status: 1 });

// Pre-save middleware to update the application count in the internship
internshipApplicationSchema.post('save', async function(doc) {
    try {
        const Internship = mongoose.model('Internship');
        await Internship.findByIdAndUpdate(
            doc.internship,
            { $inc: { applicationCount: 1 } }
        );
    } catch (error) {
        console.error('Error updating internship application count:', error);
    }
});

// Post-remove middleware to decrement application count when application is deleted
internshipApplicationSchema.post('findOneAndDelete', async function(doc) {
    try {
        if (doc) {
            const Internship = mongoose.model('Internship');
            await Internship.findByIdAndUpdate(
                doc.internship,
                { $inc: { applicationCount: -1 } }
            );
        }
    } catch (error) {
        console.error('Error updating internship application count:', error);
    }
});

module.exports = mongoose.model('InternshipApplication', internshipApplicationSchema); 