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
          isFocused && styles.inputContainerFocused, // Apply pink border when focused
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
          value={value} // Pass the value from props
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !showPassword} // Toggle password visibility
          onChangeText={handleChangeText} // Use the handleChangeText prop
          onFocus={() => setIsFocused(true)} // Set focus state to true
          onBlur={() => setIsFocused(false)} // Set focus state to false
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
    marginBottom: 20, // Spacing between form fields
    width: "80%", // Set width to 80% of the screen
    alignSelf: "center", // Center the component horizontally
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
    width: "100%", // Take up full width of the container
  },
  inputContainerFocused: {
    borderColor: "pink", // Pink border when focused
  },
  icon: {
    marginRight: 10, // Spacing between icon and input
  },
  input: {
    flex: 1, // Take up remaining space
    fontSize: 16,
    color: "#333",
  },
  toggleButton: {
    marginLeft: 10, // Spacing between input and toggle button
  },
});
