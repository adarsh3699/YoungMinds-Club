const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Internship title is required"],
			trim: true,
			maxlength: [100, "Title cannot be more than 100 characters"],
		},
		companyName: {
			type: String,
			required: [true, "Company name is required"],
			trim: true,
			maxlength: [100, "Company name cannot be more than 100 characters"],
		},
		description: {
			type: String,
			required: false,
			trim: true,
		},
		shortDescription: {
			type: String,
			required: [true, "Short description is required"],
			trim: true,
			maxlength: [200, "Short description cannot be more than 200 characters"],
		},
		// Logo will be populated dynamically via virtual field from organizer's brand logo
		type: {
			type: String,
			required: [true, "Internship type is required"],
			enum: ["Full-time", "Part-time", "Project-based", "Research", "Summer", "Winter", "Other"],
		},

		category: {
			type: String,
			required: [true, "Internship category is required"],
		},
		startDate: {
			type: Date,
			required: [true, "Start date is required"],
		},
		applicationDeadline: {
			type: Date,
			required: [true, "Application deadline is required"],
		},
		duration: {
			type: String,
			required: [true, "Duration is required"],
			enum: ["1 Month", "2 Months", "3 Months", "4 Months", "5 Months", "6 Months", "12 Months", "Other"],
		},
		location: {
			type: {
				type: String,
				enum: ["remote", "on-site", "hybrid"],
				required: [true, "Location type is required"],
			},
			city: {
				type: String,
				required: false,
			},
			state: {
				type: String,
				required: false,
			},
			country: {
				type: String,
				required: false,
			},
			address: {
				type: String,
				required: false,
			},
		},
		company: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Company/Recruiter is required"],
		},
		applicationCount: {
			type: Number,
			default: 0,
		},
		capacity: {
			type: Number,
			required: [true, "Number of positions is required"],
		},
		compensation: {
			type: {
				type: String,
				required: [true, "Compensation type is required"],
				enum: ["Paid", "Unpaid"],
			},
			amount: {
				type: Number,
				default: 0,
			},
			currency: {
				type: String,
				default: "INR",
				enum: ["USD", "INR", "EUR", "GBP"],
			},
		},
		requirements: [
			{
				type: String,
				trim: true,
			},
		],
		skills: [
			{
				type: String,
				trim: true,
			},
		],
		responsibilities: [
			{
				type: String,
				trim: true,
			},
		],
		benefits: [
			{
				type: String,
				trim: true,
			},
		],
		isPublished: {
			type: Boolean,
			default: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isFlagged: {
			type: Boolean,
			default: false,
		},
		flagReason: {
			type: String,
		},
		analytics: {
			views: {
				type: Number,
				default: 0,
			},
			uniqueVisitors: {
				type: Number,
				default: 0,
			},
			applicationsDaily: [
				{
					date: {
						type: Date,
					},
					count: {
						type: Number,
						default: 0,
					},
				},
			],
		},
		status: {
			type: String,
			enum: ["draft", "published", "closed", "completed"],
			default: "published",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Pre-save hook for location validation and logo population
internshipSchema.pre("save", async function (next) {
	if (this.location && this.location.type) {
		if (this.location.type === "on-site" || this.location.type === "hybrid") {
			if (!this.location.city || !this.location.state) {
				const error = new Error("City and state are required for on-site and hybrid internships");
				error.name = "ValidationError";
				return next(error);
			}
		}
	}

	// Validate application deadline is before start date
	if (this.applicationDeadline && this.startDate && this.applicationDeadline >= this.startDate) {
		const error = new Error("Application deadline must be before the start date");
		error.name = "ValidationError";
		return next(error);
	}

	// Logo will be handled by virtual field, no need to store it

	next();
});

// Pre-update hook for location validation
internshipSchema.pre("findOneAndUpdate", async function (next) {
	const update = this.getUpdate();

	// Check if location is being updated
	if (update.location || update["location.type"] || update["location.city"] || update["location.state"]) {
		try {
			// Get the current document to check existing values
			const currentDoc = await this.model.findOne(this.getQuery());

			// Determine the location type (from update or existing document)
			const locationType =
				update["location.type"] ||
				(update.location && update.location.type) ||
				(currentDoc && currentDoc.location && currentDoc.location.type);

			if (locationType === "on-site" || locationType === "hybrid") {
				const city =
					update["location.city"] ||
					(update.location && update.location.city) ||
					(currentDoc && currentDoc.location && currentDoc.location.city);

				const state =
					update["location.state"] ||
					(update.location && update.location.state) ||
					(currentDoc && currentDoc.location && currentDoc.location.state);

				if (!city || !state) {
					const error = new Error("City and state are required for on-site and hybrid internships");
					error.name = "ValidationError";
					return next(error);
				}
			}
		} catch (err) {
			return next(err);
		}
	}

	next();
});

// Index for better query performance
internshipSchema.index({ category: 1 });
internshipSchema.index({ type: 1 });
internshipSchema.index({ "location.city": 1 });
internshipSchema.index({ applicationDeadline: 1 });
internshipSchema.index({ compensation: 1 });
internshipSchema.index({ createdAt: -1 });
internshipSchema.index({ isPublished: 1, isFlagged: 1 });

// Virtual for logo - dynamically get from organizer's brand logo
internshipSchema.virtual("logo").get(function () {
	// If company is populated and has organizerBrandLogo, use it
	if (this.company && typeof this.company === "object" && this.company.organizerBrandLogo) {
		return this.company.organizerBrandLogo;
	}
	// Return null/undefined if not available
	return null;
});

// Virtual for determining if application deadline has passed
internshipSchema.virtual("isDeadlinePast").get(function () {
	return this.applicationDeadline < new Date();
});

// Virtual for days remaining to apply
internshipSchema.virtual("daysRemaining").get(function () {
	const now = new Date();
	const deadline = new Date(this.applicationDeadline);
	const diffTime = deadline.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
internshipSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Internship", internshipSchema);
