import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, Slot, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const TabsLayout = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    Dimensions.get("window").width < 764
  );
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "tasks", icon: "list", label: "Задачи" },
    { name: "profile", icon: "person", label: "Профиль" },
    { name: "shop", icon: "cart", label: "Магазин" },
  ];

  useEffect(() => {
    const updateLayout = ({ window }) => {
      setIsSmallScreen(window.width < 764);
    };
    const subscription = Dimensions.addEventListener("change", updateLayout);
    return () => subscription?.remove();
  }, []);

  if (isSmallScreen) {
    return (
      <>
        <Tabs
          screenOptions={{
            tabBarStyle: styles.mobileMenu,
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "#C084FC",
            tabBarLabelStyle: { fontWeight: "700", fontSize: 14 },
            tabBarItemStyle: { borderRadius: 25 },
            tabBarBackground: () => (
              <LinearGradient
                colors={["#3a0ca3", "#7209b7"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            ),
            headerShown: false,
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.label,
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <Ionicons
                    name={focused ? tab.icon : `${tab.icon}-outline`}
                    size={24}
                    color={focused ? "white" : "#C084FC"}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
        <Toast />
      </>
    );
  }

  // Десктоп-режим
  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#1e1e2e" }}>
        <View style={styles.desktopTabs}>
          {tabs.map((tab) => {
            const isActive = pathname.includes(tab.name);
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => router.push(`/(tabs)/${tab.name}`)}
                activeOpacity={0.9}
                style={[
                  styles.desktopTabWrapper,
                  isActive && styles.activeTabWrapper,
                  Platform.OS === "web" && styles.webHoverable,
                ]}
              >
                <View style={[styles.desktopTab, isActive && styles.activeTab]}>
                  <Ionicons name={tab.icon} size={22} color="white" />
                  <Text style={styles.desktopTabText}>{tab.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Активный экран */}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  mobileMenu: {
    flexDirection: "column",
    backgroundColor: "transparent",
    height: 70,
    borderTopWidth: 0,
    elevation: 10,
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
  },
  desktopTabs: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#4169d1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  desktopTabWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  activeTabWrapper: {
    transform: [{ scale: 1.1 }],
  },
  webHoverable: {
    cursor: "pointer",
  },
  desktopTab: {
    backgroundColor: "#6D8BDE",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  desktopTabText: {
    marginLeft: 8,
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
  activeTab: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
});

export default TabsLayout;
