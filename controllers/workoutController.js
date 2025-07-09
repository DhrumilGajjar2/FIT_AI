const WorkoutPlan = require("../models/WorkoutPlan");
const User = require("../models/User");

// Utility: Get start of today
const getStartOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Utility: Format exercise data
const formatExercises = (exercises, totalDuration) => {
  if (!Array.isArray(exercises)) return [];
  const durationPerExercise = Math.round(totalDuration / (exercises.length || 1));
  return exercises.map((exercise) => ({
    name: typeof exercise === "string" ? exercise : exercise.name || "Exercise",
    sets: exercise.sets || 3,
    reps: exercise.reps || 10,
    duration: exercise.duration || durationPerExercise,
  }));
};


// Optional: Modify based on health condition
const modifyWorkoutForHealthCondition = (exercises, condition) => {
  const adjustments = {
    asthma: (exs) =>
      exs.map((e) => ({
        ...e,
        name: e.name?.replace(/running/i, "walking"),
        duration: Math.min(e.duration || 10, 15),
      })),
    arthritis: (exs) =>
      exs.map((e) => ({
        ...e,
        name: e.name?.replace(/jumping/i, "stretching"),
      })),
  };
  return adjustments[condition] ? adjustments[condition](exercises) : exercises;
};

// Shared Save Logic
const saveOrUpdateWorkoutPlan = async (userId, exercises, totalDuration) => {
  const startOfDay = getStartOfDay();
  let workoutPlan = await WorkoutPlan.findOne({
    user: userId,
    createdAt: { $gte: startOfDay },
  });

  if (workoutPlan) {
    workoutPlan.exercises = exercises;
    workoutPlan.totalDuration = totalDuration;
    await workoutPlan.save();
  } else {
    workoutPlan = new WorkoutPlan({
      user: userId,
      exercises,
      totalDuration,
    });
    await workoutPlan.save();
  }

  return workoutPlan;
};

// Controller: Manual workout creation
const createWorkoutPlan = async (req, res) => {
  try {
    const { exercises, totalDuration, healthCondition } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized: Please log in." });
    if (!Array.isArray(exercises) || exercises.length === 0)
      return res.status(400).json({ error: "Exercises must be a non-empty array." });
    if (!totalDuration || typeof totalDuration !== "number" || totalDuration <= 0)
      return res.status(400).json({ error: "Total duration must be a positive number (in minutes)." });

    const modifiedExercises = healthCondition
      ? modifyWorkoutForHealthCondition(exercises, healthCondition)
      : exercises;

    const formattedExercises = formatExercises(modifiedExercises, totalDuration);
    const workoutPlan = await saveOrUpdateWorkoutPlan(userId, formattedExercises, totalDuration);

    res.status(200).json({
      message: "Workout plan saved successfully.",
      workoutPlan,
    });
  } catch (error) {
    console.error("❌ Create Workout Plan Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Controller: Store AI workout plan
const storeAiWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized: Please log in." });

    const { workout_plan } = req.body;
    if (!workout_plan || typeof workout_plan !== "object")
      return res.status(400).json({ error: "Invalid AI workout plan received." });

    const { exercises = [], duration = 30 } = workout_plan;
    const formattedExercises = formatExercises(exercises, duration);

    const workoutPlan = await saveOrUpdateWorkoutPlan(userId, formattedExercises, duration);
    res.status(200).json({
      message: "AI Workout Plan stored successfully.",
      workoutPlan,
    });
  } catch (error) {
    console.error("❌ AI Workout Plan Store Error:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Controller: Get all user workout plans
const getUserWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized: Please log in." });

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

module.exports = {
  createWorkoutPlan,
  storeAiWorkoutPlan,
  getUserWorkoutPlans,
};
