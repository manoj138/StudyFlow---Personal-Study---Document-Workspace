import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },
    avatar: {
      type: String,
      default: ""
    },
    preferences: {
      theme: { type: String, enum: ["dark", "light", "sepia"], default: "dark" },
      readerFontSize: { type: Number, default: 16 },
      readerLineHeight: { type: Number, default: 1.6 }
    },
    readingStats: {
      totalReadingTimeMinutes: { type: Number, default: 0 },
      documentsCompleted: { type: Number, default: 0 },
      currentStreakDays: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
