import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Ensure backend runs on port 5000

// ✅ Set Authorization Token Globally (Reduces Repetition)
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// ✅ User Authentication
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error("❌ Registration Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to register. Please try again.");
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, userData);
    return response.data;
  } catch (error) {
    console.error("❌ Login Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Incorrect email or password.");
  }
};

// ✅ Fetch User-Specific Diet Plans
export const getUserDietPlans = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/diet/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Diet Plan Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Could not fetch diet plan. Try again.");
  }
};

// ✅ Fetch User-Specific Workout Plans
export const getUserWorkoutPlans = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workout/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Workout Plan Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Could not fetch workout plan. Try again.");
  }
};

// ✅ Fetch AI-Based Recommendations (Fixed JSON Keys)
export const getAIRecommendations = async (userData, token) => {
  try {
    console.log("Sending AI request with token:", token);

    // ✅ Ensure correct request format
    const requestData = {
      age: userData.age,
      weight: userData.weight,
      height: userData.height,
      activityLevel: userData.activityLevel, // ✅ Fixed key name
      goal: userData.goal, // ✅ Fixed key name
      healthCondition: userData.healthCondition // ✅ Fixed key name
    };

    // ✅ Ensure auth token is set before making request
    setAuthToken(token);

    const response = await axios.post(`${API_BASE_URL}/ai/ai-recommend`, requestData);

    // ✅ Log the response
    console.log("RAW AI RESPONSE:", response.data);

    // ✅ Handle JSON parsing correctly
    if (typeof response.data === "string") {
      return JSON.parse(response.data);
    }

    return response.data;
  } catch (error) {
    console.error("❌ AI Recommendation Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "AI recommendation service unavailable.");
  }
};


// ✅ Fetch Chatbot Response (OpenAI API with Free-Tier Compliance)
export const getChatbotResponse = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chatbot/chat`, { message });

    // ✅ Handle rate limiting and API issues properly
    if (response.data.error) {
      if (response.data.error.includes("Free-tier limit reached")) {
        throw new Error("🚫 Free-tier limit reached. Try again later.");
      } else {
        throw new Error(response.data.error);
      }
    }

    return response.data.reply;
  } catch (error) {
    console.error("❌ Chatbot Error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      throw new Error("🚫 Too many requests. Please wait a moment and try again.");
    }

    throw new Error(error.response?.data?.message || "Chatbot service is currently unavailable.");
  }
};
