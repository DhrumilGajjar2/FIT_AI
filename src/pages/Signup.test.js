import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../pages/Signup";
import { BrowserRouter } from "react-router-dom";
import * as api from "../utils/api";

// Mock the registerUser API function
jest.mock("../utils/api", () => ({
  registerUser: jest.fn(),
}));

// Wrap in Router because Signup uses `useNavigate`
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Signup Component", () => {
  test("renders all input fields", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/age/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/weight/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/height/i)).toBeInTheDocument();
  });

  test("shows error if required fields are missing", async () => {
    renderWithRouter(<Signup />);
    const button = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument()
    );
  });

  test("shows error on invalid email", async () => {
    renderWithRouter(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "invalidemail" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "test123" } });
    fireEvent.change(screen.getByPlaceholderText(/age/i), { target: { value: 25 } });
    fireEvent.change(screen.getByPlaceholderText(/weight/i), { target: { value: 60 } });
    fireEvent.change(screen.getByPlaceholderText(/height/i), { target: { value: 170 } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    );
  });

  test("calls registerUser on valid form submit", async () => {
    api.registerUser.mockResolvedValueOnce({ success: true });

    renderWithRouter(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText(/age/i), { target: { value: 25 } });
    fireEvent.change(screen.getByPlaceholderText(/weight/i), { target: { value: 60 } });
    fireEvent.change(screen.getByPlaceholderText(/height/i), { target: { value: 170 } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        age: "25",
        weight: "60",
        height: "170",
      });
    });
  });
});
