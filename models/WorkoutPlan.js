const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
          default: 0,
          min: 0,
          max: 10,
        },
        reps: {
          type: Number,
          default: 0,
          min: 0,
          max: 50,
        },
        duration: {
          type: Number, // In minutes
          required: [true, "Exercise duration is required"],
          min: [1, "Duration must be at least 1 minute"],
          max: [180, "Duration should not exceed 180 minutes"],
        },
        type: {
          type: String,
          enum: ["strength", "cardio", "stretch", "other"],
          default: "strength"
        },
        caloriesBurned: {
          type: Number,
          min: 0,
          default: 0,
        }
      },
    ],
    totalDuration: {
      type: Number,
      required: true,
      default: 0,
      min: [1, "Total workout duration must be at least 1 minute"],
    },
    goal: {
      type: String,
      enum: ["fat-loss", "muscle-gain", "endurance", "flexibility"],
    },
    intensityLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
  },
  { timestamps: true }
);

workoutPlanSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("exercises")) {
    this.totalDuration = this.exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
  }
  next();
});

workoutPlanSchema.index({ user: 1, createdAt: 1 }, { unique: true });

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
module.exports = WorkoutPlan;
