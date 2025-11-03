import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import WorkoutPlan from "./WorkoutPlan";
import { BrowserRouter } from "react-router-dom";
import * as api from "../utils/api";

// Mock react-router's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock getUserWorkoutPlans API
jest.mock("../utils/api", () => ({
  getUserWorkoutPlans: jest.fn(),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("WorkoutPlan Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("redirects if no token found", async () => {
    renderWithRouter(<WorkoutPlan />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("displays loading and then workout plans", async () => {
    const fakePlans = [
      {
        createdAt: new Date().toISOString(),
        totalDuration: 40,
        exercises: [
          { name: "Push-up", sets: 3, reps: 12, duration: 5 },
          { name: "Squat", sets: 3, reps: 15, duration: 10 },
        ],
      },
    ];

    localStorage.setItem("token", "fakeToken123");
    api.getUserWorkoutPlans.mockResolvedValueOnce(fakePlans);

    renderWithRouter(<WorkoutPlan />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/your workout plans/i)).toBeInTheDocument();
      expect(screen.getByText(/total workouts: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/push-up/i)).toBeInTheDocument();
      expect(screen.getByText(/squat/i)).toBeInTheDocument();
    });
  });

  test("displays error message if API fails", async () => {
    localStorage.setItem("token", "fakeToken123");
    api.getUserWorkoutPlans.mockRejectedValueOnce(new Error("API failure"));

    renderWithRouter(<WorkoutPlan />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load workout plan/i)).toBeInTheDocument();
    });
  });

  test("displays message if no workout plans are found", async () => {
    localStorage.setItem("token", "fakeToken123");
    api.getUserWorkoutPlans.mockResolvedValueOnce([]);

    renderWithRouter(<WorkoutPlan />);

    await waitFor(() => {
      expect(screen.getByText(/no workout plan available/i)).toBeInTheDocument();
    });
  });

  test("navigates to dashboard on back button click", async () => {
    localStorage.setItem("token", "token123");
    api.getUserWorkoutPlans.mockResolvedValueOnce([]);

    renderWithRouter(<WorkoutPlan />);
    await waitFor(() => screen.getByRole("button", { name: /back to dashboard/i }));

    fireEvent.click(screen.getByRole("button", { name: /back to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
