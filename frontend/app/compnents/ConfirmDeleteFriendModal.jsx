import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ConfirmDeleteFriendModal = ({
    visible,
    onConfirm,
    onCancel,
    friendName
}) => {
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [opacityAnim] = useState(new Animated.Value(0));
    const [shakeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handleConfirm = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 150,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            })
        ]).start(() => {
            onConfirm();
        });
    };

    const handleCancel = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ]).start(() => {
            onCancel();
        });
    };

    const shakeInterpolate = shakeAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-10, 0, 10]
    });

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateX: shakeInterpolate }
                            ]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={["#1a1a2e", "#16213e", "#0f3460"]}
                        style={styles.modal}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="person-remove-outline"
                                size={40}
                                color="#FF6B6B"
                            />
                        </View>

                        <Text style={styles.title}>
                            Удалить друга?
                        </Text>

                        <Text style={styles.subtitle}>
                            Вы уверены, что хотите удалить {friendName} из друзей?
                        </Text>

                        <View style={styles.warningContainer}>
                            <View style={styles.warningContent}>
                                <Ionicons name="information-circle" size={20} color="#FFD93D" />
                                <Text style={styles.warningText}>
                                    Это действие нельзя будет отменить
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={styles.cancelButton}
                            >
                                <LinearGradient
                                    colors={["#374151", "#4B5563"]}
                                    style={styles.cancelGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.cancelText}>Отмена</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleConfirm}>
                                <LinearGradient
                                    colors={["#EF4444", "#DC2626"]}
                                    style={styles.confirmButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons
                                        name="person-remove"
                                        size={18}
                                        color="#fff"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.confirmText}>
                                        Удалить
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 380,
    },
    modal: {
        padding: 30,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 22,
    },
    warningContainer: {
        marginBottom: 30,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    warningContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    warningText: {
        color: "#FFD93D",
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    buttons: {
        flexDirection: "row",
        gap: 16,
        justifyContent: "center",
    },
    cancelButton: {
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    cancelGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    buttonIcon: {
        marginRight: 4,
    },
    confirmText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default ConfirmDeleteFriendModal;