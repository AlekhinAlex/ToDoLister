import { jwtDecode } from "jwt-decode";
import { setToken } from "./storage";

const API_BASE = "http://127.0.0.1:8000";

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 - 6000 < Date.now(); // 6 секунд до истечения
  } catch (e) {
    console.error("Ошибка декодирования токена:", e);
    return true;
  }
};

export const refreshAccessToken = async (refresh) => {
  try {
    const response = await fetch(`${API_BASE}/api/login/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error("Не удалось обновить токен");
    }

    const data = await response.json();

    if (!data.access) {
      throw new Error("Сервер не вернул новый access-токен");
    }

    console.log("Токен обновлен");

    return {
      access: data.access,
      refresh: data.refresh || refresh,
    };
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    throw error;
  }
};
