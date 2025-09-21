import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const CollaborationConfirmModal = ({
    visible,
    task,
    changes,
    onAccept,
    onReject,
    onCancel,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <LinearGradient
                    colors={["#0f0c29", "#302b63", "#24243e"]}
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <Ionicons name="alert-circle" size={28} color="#F59E0B" />
                        <Text style={styles.modalTitle}>Подтверждение изменений</Text>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        <Text style={styles.description}>
                            Владелец задачи "{task?.title}" внес изменения. Пожалуйста, подтвердите или отклоните эти изменения.
                        </Text>

                        {changes && (
                            <View style={styles.changesSection}>
                                <Text style={styles.sectionTitle}>Изменения:</Text>
                                {changes.title && (
                                    <View style={styles.changeItem}>
                                        <Text style={styles.changeLabel}>Название:</Text>
                                        <Text style={styles.changeValue}>{changes.title}</Text>
                                    </View>
                                )}
                                {changes.description && (
                                    <View style={styles.changeItem}>
                                        <Text style={styles.changeLabel}>Описание:</Text>
                                        <Text style={styles.changeValue}>{changes.description}</Text>
                                    </View>
                                )}
                                {changes.difficulty && (
                                    <View style={styles.changeItem}>
                                        <Text style={styles.changeLabel}>Сложность:</Text>
                                        <Text style={styles.changeValue}>{changes.difficulty}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton]}
                                onPress={onReject}
                            >
                                <Ionicons name="close" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Отклонить</Text>
                            </TouchableOpacity>

                            <LinearGradient
                                colors={["#10B981", "#22C55E"]}
                                style={[styles.button, styles.acceptButton]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <TouchableOpacity onPress={onAccept} style={styles.buttonInner}>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Принять</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalContent: {
        width: "90%",
        maxWidth: 400,
        maxHeight: "80%",
        borderRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    description: {
        color: "#FFFFFF",
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    changesSection: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#E0F2FE",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    changeItem: {
        marginBottom: 8,
    },
    changeLabel: {
        color: "#AAAAAA",
        fontSize: 14,
        marginBottom: 4,
    },
    changeValue: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 15,
        borderRadius: 12,
        minHeight: 50,
    },
    rejectButton: {
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    acceptButton: {
        overflow: "hidden",
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        height: "100%",
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default CollaborationConfirmModal;