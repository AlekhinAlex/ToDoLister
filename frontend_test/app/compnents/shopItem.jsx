import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ShopItem = ({
  name,
  description,
  price,
  required_xp,
  is_unlocked,
  is_purchased,
  image,
  onUnlock,
  onPurchase,
}) => {
  const getStatus = () => {
    if (is_purchased) return "purchased";
    if (is_unlocked) return "unlocked";
    return "locked";
  };

  const status = getStatus();

  return (
    <View style={[styles.itemContainer, status === "locked" && styles.lockedItem]}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemDescription}>{description}</Text>

          {status === "purchased" && (
            <Text style={styles.purchasedText}>
              <Ionicons name="checkmark-circle" size={20} color="green" /> Куплено
            </Text>
          )}

          {status === "unlocked" && (
            <>
              <View style={styles.priceContainer}>
                <Ionicons name="cash-outline" size={18} color="#FFD700" />
                <Text style={styles.itemPrice}>
                  <Text style={styles.highlightedText}>{price}</Text> золота
                </Text>
              </View>
            </>
          )}

          {status === "locked" && (
            <View style={styles.lockedInfo}>
              <Ionicons name="lock-closed-outline" size={18} color="#e67e22" />
              <Text style={styles.lockedText}>
                Нужно <Text style={styles.highlightedXP}>{required_xp}</Text> XP
              </Text>
            </View>
          )}
        </View>

        {/* Кнопки теперь в отдельном контейнере внизу */}
        <View style={styles.buttonContainer}>
          {status === "unlocked" && (
            <TouchableOpacity style={styles.purchaseButton} onPress={onPurchase}>
              <Text style={styles.purchaseButtonText}>Купить</Text>
            </TouchableOpacity>
          )}

          {status === "locked" && (
            <TouchableOpacity style={styles.unlockButton} onPress={onUnlock}>
              <Text style={styles.unlockButtonText}>Разблокировать</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: "48%",
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    maxWidth: 300,
  },
  lockedItem: {
    opacity: 0.85,
    borderColor: "#e67e22",
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 10,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: "#636e72",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 15,
    color: "#f1c40f",
    marginLeft: 6,
  },
  highlightedText: {
    fontWeight: "bold",
    backgroundColor: "#fff9d6",
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  highlightedXP: {
    fontWeight: "bold",
    backgroundColor: "#ffe1bd",
    paddingHorizontal: 5,
    borderRadius: 4,
    color: "#d35400",
  },
  lockedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  lockedText: {
    fontSize: 13,
    color: "#8e6e53",
    marginLeft: 6,
  },
  purchaseButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  purchaseButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  unlockButton: {
    backgroundColor: "#e67e22",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  unlockButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  purchasedText: {
    marginTop: 8,
    fontSize: 25,
    color: "green",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ShopItem;
