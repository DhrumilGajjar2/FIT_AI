const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  role: { type: String, default: "user" },
  dietPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "DietPlan" }], // ✅ Reference diet plans
  workoutPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan" }], // ✅ Reference workout plans
  

  recommendationHistory: [
    {
      dietPlans: { type: mongoose.Schema.Types.ObjectId, ref: "DietPlans"},
      workoutPlans: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlans" },
      mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" },
      date: { type: Date, default: Date.now},
    },
  ],

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
