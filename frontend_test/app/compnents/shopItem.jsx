import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

// "Name" of the item will be replaced with item_id.
const ShopItem = ({ name, description, price, image, onPress }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.bottomSection}>
          <View style={styles.priceContainer}>
            <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
            <Text style={styles.price}>{price}</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={onPress}>
            <Text style={styles.buttonText}>Купить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    overflow: "hidden",
    width: "48%", // For 2-column layout
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 12,
  },
  bottomSection: {
    marginTop: "auto", // Pushes to bottom
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    color: "#FFD700",
    marginLeft: 5,
  },
  buyButton: {
    backgroundColor: "#C084FC",
    borderRadius: 15,
    paddingVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ShopItem;
