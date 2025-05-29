import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InventoryItem = ({
    name,
    image,
    status,
    isEquipped,
    onEquip,
    onUnequip,
}) => {
    return (
        <View style={[styles.itemContainer, isEquipped && styles.equippedItem]}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                {isEquipped && (
                    <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.itemName}>{name}</Text>
                <Text style={styles.itemStatus}>{status}</Text>

                {isEquipped ? (
                    <TouchableOpacity
                        style={styles.unequipButton}
                        onPress={onUnequip}
                    >
                        <Text style={styles.buttonText}>Надето</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.equipButton}
                        onPress={onEquip}
                    >
                        <Text style={styles.buttonText}>Надеть</Text>
                    </TouchableOpacity>
                )}
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
    equippedItem: {
        borderColor: "#27ae60",
        borderWidth: 4,
    },
    imageWrapper: {
        width: "100%",
        height: 140,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    equippedBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 12,
        padding: 2,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    infoContainer: {
        padding: 12,
    },
    itemName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#2d3436",
        marginBottom: 4,
    },
    itemStatus: {
        fontSize: 13,
        color: "#636e72",
        marginBottom: 12,
    },
    equipButton: {
        backgroundColor: "#3498db",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    unequipButton: {
        backgroundColor: "#27ae60",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
    },
});

export default InventoryItem;