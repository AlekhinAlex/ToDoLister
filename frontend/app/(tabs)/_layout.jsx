import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname, Slot } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const TabsLayout = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    Dimensions.get("window").width < 768
  );
  const [isPanelVisible, setIsPanelVisible] = useState(!isSmallScreen);
  const router = useRouter();
  const pathname = usePathname();

  // плавная анимация панели
  const panelPosition = useRef(new Animated.Value(isSmallScreen ? -280 : 0)).current;

  const tabs = [
    { name: "tasks", icon: "list", label: "Задачи" },
    { name: "profile", icon: "person", label: "Профиль" },
    { name: "shop", icon: "cart", label: "Магазин" },
    { name: "friends", icon: "people", label: "Друзья" },
    { name: "settings", icon: "settings", label: "Настройки" },
  ];

  useEffect(() => {
    const updateLayout = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
      if (smallScreen && isPanelVisible) togglePanel(false);
      else if (!smallScreen && !isPanelVisible) togglePanel(true);
    };

    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [isPanelVisible]);

  const togglePanel = (visible) => {
    setIsPanelVisible(visible);
    Animated.spring(panelPosition, {
      toValue: visible ? 0 : -280,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  };

  const PanelContent = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Меню</Text>
        {isSmallScreen && (
          <TouchableOpacity
            onPress={() => togglePanel(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.panelItems}>
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.name);
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => {
                router.push(`/(tabs)/${tab.name}`);
                if (isSmallScreen) togglePanel(false);
              }}
              activeOpacity={0.9}
              style={[
                styles.panelItem,
                isActive && styles.panelItemActive,
              ]}
            >
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={isActive ? "#fff" : "#d1d5db"}
                style={[
                  styles.icon,
                  isActive && styles.iconActive,
                ]}
              />
              <Text
                style={[
                  styles.panelText,
                  { color: isActive ? "#fff" : "#d1d5db" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.panelFooter}>
        <Text style={styles.footerText}>ToDo List</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Кнопка меню для мобильных */}
      {isSmallScreen && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => togglePanel(true)}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.panelContainer,
          { transform: [{ translateX: panelPosition }] },
        ]}
      >
        <PanelContent />
      </Animated.View>

      {/* Контент */}
      <View
        style={[
          styles.content,
          isSmallScreen && styles.mobileContent,
        ]}
      >
        <Slot />
      </View>

      {/* Overlay на мобилках */}
      {isSmallScreen && isPanelVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => togglePanel(false)}
        />
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29", // общий тёмный фон
  },
  panelContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // полупрозрачный
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(14px)", // liquid glass эффект (только web)
    boxShadow: "2px 0 15px rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  panel: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  panelTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    padding: 5,
  },
  panelItems: {
    flex: 1,
    gap: 10,
  },
  panelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    transition: "all 0.25s ease",
    cursor: "pointer",
  },
  panelItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  icon: {
    marginRight: 12,
  },
  iconActive: {
    textShadow: "0 0 8px rgba(255,255,255,0.7)",
  },
  panelText: {
    fontWeight: "600",
    fontSize: 16,
  },
  panelFooter: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 12,
  },
  content: {
    flex: 1,
    marginLeft: 280,
    // padding : 20,
  },
  mobileContent: {
    marginLeft: 0,
  },
  menuButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 10,
    backdropFilter: "blur(10px)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },
});

export default TabsLayout;
