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

// Method to check if user account is active
userSchema.methods.isActive = function () {
	return this.status === "active";
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	// Token expires in 10 minutes
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

// Method to check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function (token) {
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

	return this.passwordResetToken === hashedToken && this.passwordResetExpires > Date.now();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
