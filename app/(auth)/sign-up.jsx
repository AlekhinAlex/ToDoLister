import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // For gradient background
import FormField from "../compnents/formField"; // Ensure the path is correct

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passwordProof: "",
  });

  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time validation for passwords and null strings
  useEffect(() => {
    validateForm();
  }, [form.password, form.passwordProof, form.username, form.email]);

  const validateForm = () => {
    // Check for null strings
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.passwordProof
    ) {
      setError("Все поля обязательны для заполнения");
      setIsFormValid(false);
      return;
    }

    // Check if passwords match
    if (form.password !== form.passwordProof) {
      setError("Пароли не совпадают");
      setIsFormValid(false);
      return;
    }

    // Check password strength
    const strength = checkPasswordStrength(form.password);
    setPasswordStrength(strength);

    if (strength === "weak") {
      setError("Пароль слишком слабый");
      setIsFormValid(false);
      return;
    }

    // If all checks pass
    setError("");
    setIsFormValid(true);
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (strongRegex.test(password)) {
      return "strong";
    } else if (mediumRegex.test(password)) {
      return "medium";
    } else {
      return "weak";
    }
  };

  //!=================== Send data to the API
  const sendData = async () => {
    try {
      const url = "http://10.0.2.2:8000/api/events/"; //TODO: <- CHANGE TO THE ACTUAL
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        //TODO: Refactor when db is ready
        body: JSON.stringify({
          name: form.username,
          description: form.email,
          date: "2025-03-03",
        }),
        //TODO: Refactor when db is ready
      });

      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);

      if (response.ok) {
        const result = JSON.parse(rawResponse);
        Alert.alert("Успех", "Вы успешно зарегистрировались!");

        //Clear the input area
        setForm({
          username: "",
          email: "",
          password: "",
          passwordProof: "",
        });
      } else {
        console.log("ERROR:", rawResponse);
        Alert.alert(
          "Ошибка",
          "Не удалось зарегистрироваться. Попробуйте снова."
        );
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Ошибка", "Произошла ошибка при отправке данных.");
    }
  };
  //!===================== Send data to API

  // Handle sign-up
  const handleSignUp = () => {
    if (!isFormValid) {
      Alert.alert("Ошибка", "Пожалуйста, исправьте ошибки в форме");
      return;
    }

    // Proceed with sign-up logic
    sendData();
  };

  return (
    <LinearGradient
      colors={["#1E3A8A", "#C084FC"]}
      start={{ x: 1, y: 1 }} // Top-left
      end={{ x: 0, y: 0 }} // Bottom-right
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Handle keyboard interactions
        >
          {/* Header */}
          <Text style={styles.header}>Регистрация</Text>

          {/* Username Field */}
          <FormField
            name="Имя пользователя"
            title="username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            placeholder="Введите имя пользователя"
          />

          {/* Email Field */}
          <FormField
            name="Email"
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            placeholder="Введите ваш email"
            iconName="mail-outline" // Optional icon
            keyboardType="email-address"
          />

          {/* Password Field */}
          <FormField
            name="Пароль"
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            placeholder="Введите ваш пароль"
            iconName="lock-closed-outline" // Optional icon
            secureTextEntry // Enable password toggle
          />

          {/* Confirm Password Field */}
          <FormField
            name="Повторите пароль"
            title="Confirm Password"
            value={form.passwordProof}
            handleChangeText={(e) => setForm({ ...form, passwordProof: e })}
            placeholder="Повторите ваш пароль"
            iconName="lock-closed-outline" // Optional icon
            secureTextEntry // Enable password toggle
          />

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          </TouchableOpacity>

          {/* Login Section */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Уже зарегистрированы? Так чего вы ждете!
            </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Войти</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUp;

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
  header: {
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
  },
  disabledButton: {
    backgroundColor: "#CCCCCC", // button when form is invalid
  },
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
    backgroundColor: "transparent",
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
    color: "red",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  strengthweak: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  strengthmedium: {
    color: "orange",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  strengthstrong: {
    color: "green",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
