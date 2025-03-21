// models/DietPlan.js - Diet Plan Schema
const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexing for better query performance
    },
    meals: [
      {
        mealType: {
          type: String,
          required: [true, "Meal type is required"], // Example: Breakfast, Lunch, Dinner, Snack
          trim: true,
        },
        foodItems: {
          type: [String],
          required: [true, "At least one food item is required"],
          validate: {
            validator: function (arr) {
              return arr.length > 0 && arr.every(item => typeof item === "string" && item.trim().length > 0);
            },
            message: "Food items must be non-empty strings.",
          },
        },
        calories: {
          type: Number,
          required: [true, "Calories count is required"],
          min: [0, "Calories cannot be negative"],
        },
      },
    ],
    totalCalories: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Total calories cannot be negative"],
    },
  },
  { timestamps: true }
);

// Auto-calculate totalCalories before saving (if not provided)
dietPlanSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("meals")) {
    this.totalCalories = this.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  }
  next();
});

// Prevent multiple diet plans per user per day
dietPlanSchema.index({ user: 1, createdAt: 1 }, { unique: true });

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
module.exports = DietPlan;
