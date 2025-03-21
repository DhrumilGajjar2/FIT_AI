// models/WorkoutPlan.js - Workout Plan Schema
const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexing for faster queries
    },
    exercises: [
      {
        name: {
          type: String,
          required: [true, "Exercise name is required"],
          trim: true,
          minlength: [2, "Exercise name must be at least 2 characters"],
        },
        sets: {
          type: Number,
          required: true,
          default: 3,
          min: [1, "Sets must be at least 1"],
          max: [10, "Sets should not exceed 10"], // Prevent unrealistic values
        },
        reps: {
          type: Number,
          required: true,
          default: 10,
          min: [1, "Reps must be at least 1"],
          max: [50, "Reps should not exceed 50"], // Prevent unrealistic values
        },
        duration: {
          type: Number, // Duration in minutes
          required: [true, "Exercise duration is required"],
          min: [1, "Duration must be at least 1 minute"],
          max: [180, "Duration should not exceed 180 minutes"], // Prevent unrealistic values
        },
      },
    ],
    totalDuration: {
      type: Number,
      required: true,
      min: [1, "Total workout duration must be at least 1 minute"],
      default: 0, // Auto-calculated before saving
    },
  },
  { timestamps: true }
);

// ✅ Auto-calculate totalDuration before saving
workoutPlanSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("exercises")) {
    this.totalDuration = this.exercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);
  }
  next();
});

// ✅ Prevent multiple workout plans per user per day
workoutPlanSchema.index({ user: 1, createdAt: 1 }, { unique: true });

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
module.exports = WorkoutPlan;
