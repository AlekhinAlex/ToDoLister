import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons"; // For icons

const FormField = ({
  title,
  name,
  value,
  placeholder,
  iconName,
  secureTextEntry = false,
  handleChangeText, // Accept handleChangeText prop
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Track focus state

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{name}</Text>

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {/* Icon (optional) */}
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color="#666"
            style={styles.icon}
          />
        )}

        {/* Input Field */}
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !showPassword} // Toggle password visibility
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Show/Hide Password Button */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
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
    width: "80%",
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  inputContainerFocused: {
    borderColor: "white",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  toggleButton: {
    marginLeft: 10,
  },
});
