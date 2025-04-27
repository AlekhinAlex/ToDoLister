import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getToken = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("token");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Ошибка при получении токенов:", e);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", JSON.stringify(token));
  } catch (e) {
    console.error("Ошибка при сохранении токенов:", e);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.error("Ошибка при удалении токенов:", e);
  }
};
