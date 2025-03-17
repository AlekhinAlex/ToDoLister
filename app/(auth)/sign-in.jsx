import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FormField from "../compnents/formField";

const SignIn = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Email validation
    if (!form.email) {
      newErrors.email = "Email обязателен";
      isValid = false;
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleError = (error) => {
    if (!error?.response) {
      Alert.alert("Ошибка", "Нет соединения с сервером");
    } else if (error.response?.status === 401) {
      Alert.alert("Ошибка", "Неверный email или пароль");
    } else {
      Alert.alert("Ошибка", "Что-то пошло не так. Попробуйте позже");
    }
  };

  const logIn = async () => {
    if (!validateForm()) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      //!===============API DUMMY===================
      const url = `https://dummy-api/login`;
      //!===========================================
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Успех", "Вы успешно вошли в систему!");
        router.replace("/(tabs)/tasks");
      } else {
        Alert.alert("Ошибка", data.message || "Неверный email или пароль");
      }
    } catch (error) {
      console.error("Network Error:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#1E3A8A", "#C084FC"]}
        start={{ x: 0, y: 0 }} // Top-left
        end={{ x: 1, y: 0 }} // Bottom-right
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.header}>Вход в Аккаунт</Text>

            <View style={styles.formContainer}>
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
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
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
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={logIn}
                disabled={isLoading}
                accessibilityLabel="Sign in button"
                accessibilityHint="Tap to sign in to your account"
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
              //!============LOGIN FOR TESTING==============================
              <View style={styles.registerContainer}>
                <Link href="/(tabs)/tasks" asChild>
                  <TouchableOpacity style={styles.testButton}>
                    <Text style={styles.registerButtonText}>ТЕСТОВЫЙ ВХОД</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              //!============LOGIN FOR TESTING==============================
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  header: {
    fontFamily: "Helvetica",
    fontSize: 28,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A", // Match the background gradient
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
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },

  //!====BUTTON FOR TESTING====
  testButton: {
    backgroundColor: "red",
    borderWidth: 3,
    borderColor: "blue",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  //!====BUTTON FOR TESTING====

  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    color: "#FF0000",
    alignItems: "center",
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
    alignSelf: "center",
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default SignIn;
