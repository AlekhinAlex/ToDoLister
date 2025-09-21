import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
  name,
  value,
  placeholder,
  iconName,
  secureTextEntry = false,
  handleChangeText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{name}</Text>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocused ? "#fff" : "rgba(255,255,255,0.6)"}
            style={styles.icon}
          />
        )}

        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.5)"
          secureTextEntry={secureTextEntry && !showPassword}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={isFocused ? "#fff" : "rgba(255,255,255,0.6)"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "web" ? 14 : 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: "100%",
    transition: "all 0.3s ease", // работает только в web
  },
  inputContainerFocused: {
    borderColor: "#000000ff",
    backgroundColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000000ff",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    outlineStyle: "none"
  }, toggleButton: {
    marginLeft: 10,
  },
});
