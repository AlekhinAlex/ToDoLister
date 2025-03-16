import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FormField from "../compnents/formField";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <LinearGradient colors={["#FF9A9E", "#FAD0C4"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Handle keyboard interactions
        >
          {/* Header */}
          <Text style={styles.header}>Вход в Аккаунт</Text>

          {/* Email Field */}

          <FormField
            name="Email"
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            placeholder="Введите ваш email"
            iconName="mail-outline"
          />

          {/* Password Field */}
          <FormField
            name="Пароль"
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            placeholder="Введите ваш пароль"
            iconName="lock-closed-outline"
            secureTextEntry
          />

          {/* Sign In Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>

          {/* Register Section */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Неужели нет аккаунта?</Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText} on>
                  Зарегистрироваться
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignIn;

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
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF9A9E",
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
});
