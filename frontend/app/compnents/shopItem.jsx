import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ShopItem = ({
  name,
  description,
  price,
  required_rank,
  rank_name,
  is_available,
  is_unlocked,
  is_purchased,
  image,
  onUnlock,
  onPurchase,
  current_rank,
}) => {
  const getStatus = () => {
    if (is_purchased) return "purchased";
    if (is_unlocked) return "unlocked";
    if (!is_available) return "locked_by_rank";
    return "locked";
  };

  const status = getStatus();

  return (
    <View
      style={[
        styles.itemContainer,
        status === "locked_by_rank" && styles.lockedByRankItem,
        status === "locked" && styles.lockedItem,
      ]}
    >
      {/* Картинка */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.image} />
        {!is_available && (
          <View style={styles.rankRequirement}>
            <Ionicons name="ribbon-outline" size={16} color="#fff" />
            <Text style={styles.rankRequirementText}>
              Ранг {rank_name || required_rank}
            </Text>
          </View>
        )}
      </View>

      {/* Инфо */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemDescription}>{description}</Text>

        {status === "purchased" && (
          <Text style={styles.purchasedText}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" /> Куплено
          </Text>
        )}

        {status === "unlocked" && (
          <View style={styles.priceContainer}>
            <Ionicons name="cash-outline" size={18} color="#FFD700" />
            <Text style={styles.itemPrice}>
              <Text style={styles.highlightedText}>{price}</Text> золота
            </Text>
          </View>
        )}

        {status === "locked" && (
          <View style={styles.lockedInfo}>
            <Ionicons name="lock-closed-outline" size={18} color="#e67e22" />
            <Text style={styles.lockedText}>Предмет заблокирован</Text>
          </View>
        )}

        {status === "locked_by_rank" && (
          <View style={styles.lockedInfo}>
            <Ionicons name="lock-closed-outline" size={18} color="#9b59b6" />
            <Text style={styles.lockedText}>
              Требуется ранг {rank_name || required_rank}
            </Text>
            <Text style={styles.rankProgress}>Ваш ранг: {current_rank}</Text>
          </View>
        )}

        {/* Кнопки */}
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

          {status === "locked_by_rank" && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Ваш ранг: {current_rank} / Требуется: {required_rank}
              </Text>
            </View>
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingBottom: 10,
    transition: "all 0.3s ease",
    cursor: "pointer",
    backdropFilter: "blur(10px)", // эффект стекла для web
  },
  lockedItem: {
    opacity: 0.85,
    borderColor: "#e67e22",
  },
  lockedByRankItem: {
    opacity: 0.7,
    borderColor: "#9b59b6",
  },
  imageWrapper: {
    width: "100%",
    height: 150,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  rankRequirement: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(155, 89, 182, 0.85)",
    padding: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  rankRequirementText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: "#bdc3c7",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 15,
    color: "#FFD700",
    marginLeft: 6,
  },
  highlightedText: {
    fontWeight: "bold",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  lockedInfo: {
    marginBottom: 6,
  },
  lockedText: {
    fontSize: 13,
    color: "#ff9f43",
    marginLeft: 6,
  },
  rankProgress: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
    marginLeft: 6,
  },
  purchasedText: {
    marginTop: 8,
    fontSize: 16,
    color: "#2ecc71",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 10,
  },
  purchaseButton: {
    backgroundColor: "linear-gradient(90deg, #6a11cb, #2575fc)", // для web
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#2575fc",
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  purchaseButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  unlockButton: {
    backgroundColor: "linear-gradient(90deg, #e67e22, #f39c12)", // для web
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  unlockButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  progressText: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
  },
});

export default ShopItem;
