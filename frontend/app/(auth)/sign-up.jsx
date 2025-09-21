import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import FormField from "../compnents/formField";
import { API_BASE } from "../lib/api";

const SignUp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passwordProof: "",
  });
  const [errors, setErrors] = useState({});
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!form.username) {
      newErrors.username = "Имя пользователя обязательно";
      isValid = false;
    }
    if (!form.email) {
      newErrors.email = "Email обязателен";
      isValid = false;
    }
    if (!form.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    }
    if (form.password !== form.passwordProof) {
      newErrors.passwordProof = "Пароли не совпадают";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const signUp = async () => {
    if (!validateForm()) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          password2: form.passwordProof,
        }),
      });

      const data = await response.json();
      console.log("Ответ сервера:", data);

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Успешная регистрация!",
          text2: "Теперь вы можете войти",
          position: "top",
          visibilityTime: 3000,
          topOffset: 60,
        });

        router.replace("/sign-in");
      } else {
        const serverErrors = {};

        // Проверим, есть ли поля ошибок
        for (let key in data) {
          if (Array.isArray(data[key])) {
            serverErrors[key] = data[key][0];
          }
        }

        setErrors(serverErrors);

        Toast.show({
          type: "error",
          text1: "Ошибка регистрации",
          text2:
            data.detail ||
            data.message ||
            "Проверьте корректность введённых данных",
          position: "top",
          visibilityTime: 3000,
          topOffset: 60,
        });
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка подключения",
        text2: error.message || "Проверьте соединение с сервером",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#24243e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Регистрация</Text>

          <View style={styles.registerBlock}>
            <FormField
              name="Имя пользователя"
              title="username"
              value={form.username}
              handleChangeText={(e) => {
                setForm({ ...form, username: e });
                setErrors({ ...errors, username: "" });
              }}
              placeholder="Введите имя пользователя"
              error={errors.username}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <FormField
              name="Email"
              title="Email"
              value={form.email}
              handleChangeText={(e) => {
                setForm({ ...form, email: e });
                setErrors({ ...errors, email: "" });
              }}
              placeholder="Введите ваш email"
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
              secureTextEntry
              error={errors.password}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <FormField
              name="Повторите пароль"
              title="Confirm Password"
              value={form.passwordProof}
              handleChangeText={(e) => {
                setForm({ ...form, passwordProof: e });
                setErrors({ ...errors, passwordProof: "" });
              }}
              placeholder="Повторите пароль"
              secureTextEntry
              error={errors.passwordProof}
            />
            {errors.passwordProof && (
              <Text style={styles.errorText}>{errors.passwordProof}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={signUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FF9A9E" />
              ) : (
                <Text style={styles.buttonText}>Зарегистрироваться</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Уже зарегистрированы?</Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity style={styles.registerButton}>
                  <Text style={styles.registerButtonText}>Войти</Text>
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

export default SignUp;
