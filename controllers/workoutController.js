const WorkoutPlan = require("../models/WorkoutPlan");

const createWorkoutPlan = async (req, res) => {
  try {
    const { exercises, totalDuration, healthCondition } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: "Exercises must be a non-empty array." });
    }

    if (!totalDuration || typeof totalDuration !== "number" || totalDuration <= 0) {
      return res.status(400).json({ error: "Total duration must be a positive number (in minutes)." });
    }

    // ✅ Overwrite today's existing plan instead of blocking the request
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingPlan = await WorkoutPlan.findOne({ user: userId, createdAt: { $gte: startOfDay } });

    if (existingPlan) {
      existingPlan.exercises = exercises;
      existingPlan.totalDuration = totalDuration;
      await existingPlan.save();
      return res.status(200).json({ message: "Workout plan updated successfully.", workoutPlan: existingPlan });
    }

    const newWorkoutPlan = new WorkoutPlan({ user: userId, exercises, totalDuration });
    await newWorkoutPlan.save();

    res.status(201).json({ message: "Workout plan created successfully.", workoutPlan: newWorkoutPlan });
  } catch (error) {
    console.error("❌ Create Workout Plan Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

const storeAiWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    const { workout_plan } = req.body;

    if (!workout_plan || typeof workout_plan !== "object") {
      return res.status(400).json({ error: "Invalid AI workout plan received." });
    }

    console.log("📥 Storing AI Workout Plan for user:", userId);

    const formattedExercises = Array.isArray(workout_plan.exercises)
      ? workout_plan.exercises.map((exercise) => ({
          name: exercise,
          sets: 3,
          reps: 10,
          duration: Math.round(workout_plan.duration / workout_plan.exercises.length),
        }))
      : [];

    // ✅ Overwrite today's workout plan instead of rejecting
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let existingPlan = await WorkoutPlan.findOne({ user: userId, createdAt: { $gte: startOfDay } });

    if (existingPlan) {
      existingPlan.exercises = formattedExercises;
      existingPlan.totalDuration = workout_plan.duration;
      await existingPlan.save();
      console.log("✅ AI Workout Plan updated successfully.");
      return res.status(200).json({ message: "AI Workout Plan updated successfully.", workoutPlan: existingPlan });
    }

    const newWorkoutPlan = new WorkoutPlan({
      user: userId,
      exercises: formattedExercises,
      totalDuration: workout_plan.duration,
    });

    await newWorkoutPlan.save();
    console.log("✅ AI Workout Plan stored successfully.");
    res.status(201).json({ message: "AI Workout Plan stored successfully.", workoutPlan: newWorkoutPlan });
  } catch (error) {
    console.error("❌ AI Workout Plan Store Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

const getUserWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in." });
    }

    console.log("📥 Fetching workout plans for user:", userId);
    const workoutPlans = await WorkoutPlan.find({ user: userId }).sort({ createdAt: -1 });

    if (!workoutPlans.length) {
      return res.status(404).json({ error: "No workout plans found." });
    }

    res.json(workoutPlans);
  } catch (error) {
    console.error("❌ Get Workout Plans Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

module.exports = { createWorkoutPlan, storeAiWorkoutPlan, getUserWorkoutPlans };
