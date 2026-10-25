
import api from "@/lib/axios";

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const verifyEmail = async (data: {
  email: string;
  otp: string;
}) => {
  const response = await api.post("/api/auth/verify-email", data);
  return response.data;
};

export const resendOtp = async (email: string) => {
  const response = await api.post("/api/auth/resend-otp", {
    email,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/auth/get-me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};
