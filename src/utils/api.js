
import axios from "axios";

// ✅ Axios Instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // Optional: 10 sec timeout
});

// ✅ Set Authorization Token Globally
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ Central Error Extractor
const extractError = (error, fallbackMsg) =>
  error.response?.data?.message || error.response?.data || error.message || fallbackMsg;

// ✅ User Authentication
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Registration Error:", extractError(error));
    throw new Error(extractError(error, "Failed to register. Please try again."));
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post("/users/login", userData);
    return response.data;
  } catch (error) {
    console.error("❌ Login Error:", extractError(error));
    throw new Error(extractError(error, "Incorrect email or password."));
  }
};

// ✅ Fetch User-Specific Diet Plans
export const getUserDietPlans = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/diet/user");
    return response.data;
  } catch (error) {
    console.error("❌ Diet Plan Error:", extractError(error));
    throw new Error(extractError(error, "Could not fetch diet plan. Try again."));
  }
};

// ✅ Fetch User-Specific Workout Plans
export const getUserWorkoutPlans = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/workout/user");
    return response.data;
  } catch (error) {
    console.error("❌ Workout Plan Error:", extractError(error));
    throw new Error(extractError(error, "Could not fetch workout plan. Try again."));
  }
};

// ✅ Fetch AI-Based Recommendations
export const getAIRecommendations = async (userData, token) => {
  try {
    setAuthToken(token);
    const requestData = {
      age: userData.age,
      weight: userData.weight,
      height: userData.height,
      activityLevel: userData.activityLevel,
      goal: userData.goal,
      healthCondition: userData.healthCondition,
      dietPreference: userData.dietPreference,
    };

    const response = await api.post("/ai/ai-recommend", requestData);
    const data = response.data;

    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("❌ AI Recommendation Error:", extractError(error));
    throw new Error(extractError(error, "AI recommendation service unavailable."));
  }
};

// ✅ Chatbot API
export const getChatbotResponse = async (message) => {
  try {
    const response = await api.post("/chatbot/chat", { message });

    if (response.data.error) {
      if (response.data.error.includes("Free-tier limit reached")) {
        throw new Error("🚫 Free-tier limit reached. Try again later.");
      } else {
        throw new Error(response.data.error);
      }
    }

    return response.data.reply;
  } catch (error) {
    console.error("❌ Chatbot Error:", extractError(error));
    throw new Error(
      extractError(error, "Chatbot service is currently unavailable.")
    );
  }
};
