import { StyleSheet } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For icons

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: tabStyle.menu, // Apply the style to the tab bar
          tabBarActiveTintColor: "white", // Color of the active tab label
          tabBarInactiveTintColor: "black", // Color of the inactive tab label
          tabBarLabelStyle: {
            fontWeight: "700",
            fontSize: 16,
          },
          tabBarItemStyle: {
            borderRadius: 25, // Rounded corners for each tab
            marginHorizontal: 10, // Spacing between tabs
            marginVertical: 5, // Vertical spacing
          },
        }}
      >
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Задачи",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "list" : "list-outline"}
                size={24}
                color={focused ? "white" : "black"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Профиль",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? "white" : "black"}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;

const tabStyle = StyleSheet.create({
  menu: {
    backgroundColor: "pink", // Background color of the tab bar
    height: 60, // Adjust the height of the tab bar
    borderTopWidth: 0, // Remove the top border
    elevation: 10, // Add shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
