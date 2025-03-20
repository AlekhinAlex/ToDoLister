import { StyleSheet } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: tabStyle.menu,
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "#C084FC",
          tabBarLabelStyle: {
            fontWeight: "700",
            fontSize: 16,
          },
          tabBarItemStyle: {
            borderRadius: 25,
            marginHorizontal: 5,
            marginVertical: 5,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={["#1E3A8A", "#C084FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={tabStyle.gradient}
            />
          ),
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
                size={28}
                color={focused ? "white" : "#C084FC"}
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
                size={28}
                color={focused ? "white" : "#C084FC"}
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
    backgroundColor: "transparent",
    height: 70,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginHorizontal: 13,
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: 30,
  },
});
