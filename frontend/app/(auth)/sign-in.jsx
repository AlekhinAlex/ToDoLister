import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import FormField from "../compnents/formField";
import jwtDecode from "jwt-decode";
import { setToken, getToken } from "../(tabs)/lib/storage";
import { API_BASE } from "../(tabs)/lib/api";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

const SignIn = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  useEffect(() => {
    const checkAuth = async () => {
      const rawToken = await AsyncStorage.getItem("token");
      if (!rawToken) return;

      try {
        const tokenObj = JSON.parse(rawToken);

        if (tokenObj.access && !isTokenExpired(tokenObj.access)) {
          router.replace("/(tabs)/tasks");
        } else if (tokenObj.refresh && !isTokenExpired(tokenObj.refresh)) {
          const response = await fetch(`${API_BASE}/api/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: tokenObj.refresh }),
          });

          const data = await response.json();
          if (response.ok && data.access) {
            await AsyncStorage.setItem("token", JSON.stringify({
              access: data.access,
              refresh: tokenObj.refresh,
            }));
            router.replace("/(tabs)/tasks");
          } else {
            await AsyncStorage.removeItem("token");
          }
        } else {
          await AsyncStorage.removeItem("token");
        }
      } catch (e) {
        console.error("Ошибка при парсинге токена:", e);
        await AsyncStorage.removeItem("token");
      }
    };

    checkAuth();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!form.email) {
      newErrors.email = "Email обязателен";
      isValid = false;
    }
    if (!form.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const logIn = async () => {
    if (!validateForm()) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const url = `${API_BASE}/api/login/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.access && data.refresh) {
        await setToken({
          access: data.access,
          refresh: data.refresh,
        });

        // ➕ Добавим вывод в консоль содержимого хранилища
        const saved = await getToken();
        console.log("🎯 Токены сохранены в AsyncStorage:", saved);

        Toast.show({
          type: "success",
          text1: "Успешный вход!",
          text2: `Добро пожаловать, ${form.email}`,
        });

        router.replace("/(tabs)/tasks");
      } else {
        Toast.show({
          type: "error",
          text1: "Ошибка входа",
          text2: data.message || "Неверный email или пароль",
        });
      }
    } catch (error) {
      console.error('Login Error:', error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Проверьте соединение с сервером",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1E3A8A", "#C084FC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Вход в Аккаунт</Text>

          <View style={styles.registerBlock}>
            <FormField
              name="Email"
              title="Email"
              value={form.email}
              handleChangeText={(e) => {
                setForm({ ...form, email: e });
                setErrors({ ...errors, email: "" });
              }}
              placeholder="Введите ваш email"
              iconName="mail-outline"
              error={errors.email}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <FormField
              name="Пароль"
              title="Password"
              value={form.password}
              handleChangeText={(e) => {
                setForm({ ...form, password: e });
                setErrors({ ...errors, password: "" });
              }}
              placeholder="Введите ваш пароль"
              iconName="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={logIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FF9A9E" />
              ) : (
                <Text style={styles.buttonText}>Войти</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Неужели нет аккаунта?</Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>
                    Зарегистрироваться
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  registerBlock: {
    width: "100%",
    maxWidth: 400,
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  registerButton: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
    alignSelf: "center",
  },
});

export default SignIn;
