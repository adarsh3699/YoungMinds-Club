const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: function () {
				return !this.googleId; // Password not required if user signed up with Google
			},
			minlength: [8, "Password must be at least 8 characters long"],
		},
		// Google authentication fields
		googleId: {
			type: String,
			sparse: true,
			unique: true,
		},
		googleRefreshToken: String,
		role: {
			type: String,
			enum: ["user", "organizer", "admin"],
			default: "user",
		},
		status: {
			type: String,
			enum: ["active", "suspended"],
			default: "active",
		},
		// Organizer approval status
		organizerStatus: {
			type: String,
			enum: ["none", "pending", "approved", "rejected"],
			default: "none",
		},
		// Organizer application data
		organizerApplication: {
			organizationName: {
				type: String,
				trim: true,
			},
			reason: {
				type: String,
				trim: true,
			},
			experience: {
				type: String,
				trim: true,
			},
			socialLinks: {
				type: String,
				trim: true,
			},
			appliedAt: {
				type: Date,
			},
			reviewedAt: {
				type: Date,
			},
			reviewedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			rejectionReason: {
				type: String,
				trim: true,
			},
			reapplicationCount: {
				type: Number,
				default: 0,
			},
			lastRejectedAt: {
				type: Date,
			},
		},
		college: {
			type: String,
			trim: true,
		},
		// Fields for organizer profile
		organizationName: {
			type: String,
			trim: true,
		},
		bio: {
			type: String,
			trim: true,
		},
		socialLinks: {
			website: {
				type: String,
				trim: true,
			},
			linkedin: {
				type: String,
				trim: true,
			},
			twitter: {
				type: String,
				trim: true,
			},
			instagram: {
				type: String,
				trim: true,
			},
		},
		// Organizer location fields
		location: {
			city: {
				type: String,
				trim: true,
			},
			state: {
				type: String,
				trim: true,
			},
			country: {
				type: String,
				trim: true,
				default: "India",
			},
			address: {
				type: String,
				trim: true,
			},
		},
		isFlagged: {
			type: Boolean,
			default: false,
		},
		flagReason: {
			type: String,
		},
		googleId: {
			type: String,
		},
		googleRefreshToken: {
			type: String,
		},
		profilePicture: {
			type: String,
		},
		organizerBrandLogo: {
			type: String,
		},
		// Password reset fields
		passwordResetToken: {
			type: String,
		},
		passwordResetExpires: {
			type: Date,
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

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password") || !this.password) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
	return this.role === "admin";
};

// Method to check if user is organizer
userSchema.methods.isOrganizer = function () {
	return this.role === "organizer" || this.role === "admin";
};

// Method to check if user is approved organizer (can create events/internships)
userSchema.methods.isApprovedOrganizer = function () {
	if (this.role === "admin") return true;
	return this.role === "organizer" && this.organizerStatus === "approved";
};

// Method to check if user account is active
userSchema.methods.isActive = function () {
	return this.status === "active";
};

const User = mongoose.model("User", userSchema);

module.exports = User;
