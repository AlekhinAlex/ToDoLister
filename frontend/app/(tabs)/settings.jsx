import React, { useState, useEffect } from "react";
import {
    View,
    Image,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity,
    Alert,
} from "react-native";
import {
    Text,
    ActivityIndicator,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, removeToken, setToken } from "../lib/storage";
import { isTokenExpired, refreshAccessToken } from "../lib/authTokenManager";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import FormField from "../compnents/formField"

const SettingsScreen = () => {
    const { width: screenWidth } = useWindowDimensions();
    const isCompact = screenWidth > 764;

    const [visible, setVisible] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        avatar: "default-avatar.png",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });


    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            let token = await getToken();

            if (!token || !token.access) throw new Error("Токены отсутствуют");

            if (isTokenExpired(token.access)) {
                if (!token.refresh || isTokenExpired(token.refresh)) {
                    throw new Error("Требуется повторная авторизация");
                }

                const newTokens = await refreshAccessToken(token.refresh);
                token = newTokens;
                await setToken(token);
            }

            const userResponse = await fetch(`${API_BASE}/api/user/me/`, {
                headers: { Authorization: `Bearer ${token.access}` },
            });

            if (!userResponse.ok) throw new Error("Ошибка получения данных пользователя");

            const userData = await userResponse.json();

            // ! Временно, пока нет нормальной аватарки
            let avatarUrl = "https://i.imgur.com/mCHMpLT.png";
            if (userData.avatar) {
                ``
                avatarUrl = userData.avatar.startsWith('http')
                    ? userData.avatar
                    : `${API_BASE}${userData.avatar}`;
            }

            setUserData({
                name: userData.name || userData.username,
                email: userData.email,
                avatar: avatarUrl,
            });

            setFormData({
                name: userData.name || userData.username,
                email: userData.email,
            });

        } catch (error) {
            console.error("Ошибка авторизации:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка авторизации",
                text2: error.message || "Пожалуйста, войдите заново",
            });
            await removeToken();
            router.replace("/(auth)/sign-in");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await removeToken();
        Toast.show({
            type: "success",
            text1: "Вы вышли из аккаунта",
            position: "top",
            visibilityTime: 2000,
            topOffset: 60,
        });
        router.replace("/(auth)/sign-in");
    };

    const dataUrlToFile = (dataUrl, filename) => {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Ошибка", "Необходимо разрешение на доступ к галерее.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (result.canceled) return;

        const base64Uri = result.assets[0].uri;
        const file = dataUrlToFile(base64Uri, 'avatar.png');

        try {
            const token = await getToken();

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_BASE}/api/user/upload_avatar/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.access}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Ошибка загрузки аватарки");
            }

            const data = await response.json();

            setUserData(prev => ({
                ...prev,
                avatar: data.avatar_url || base64Uri,
            }));

            Toast.show({
                type: "success",
                text1: "Аватарка обновлена",
            });
        } catch (error) {
            console.error("Ошибка загрузки аватарки:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка загрузки аватарки",
                text2: error.message || "Попробуйте еще раз",
            });
        }
    };

    const validatePasswordChange = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = "Текущий пароль обязателен";
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "Новый пароль обязателен";
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = "Пароль должен содержать минимум 6 символов";
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Пароли не совпадают";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Имя обязательно";
        if (!formData.email.trim()) newErrors.email = "Email обязателен";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Некорректный email";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setSaving(true);
            const token = await getToken();

            const response = await fetch(`${API_BASE}/api/user/update-profile/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.access}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Ошибка обновления профиля");
            }

            // Обновляем реальные данные после успеха
            setUserData((prev) => ({
                ...prev,
                name: formData.name,
                email: formData.email,
            }));

            Toast.show({
                type: "success",
                text1: "Изменения сохранены",
            });
        } catch (error) {
            console.error("Ошибка обновления профиля:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error.message || "Попробуйте снова",
            });
        } finally {
            setSaving(false);
        }
    };


    const handleChangePassword = async () => {
        if (!validatePasswordChange()) return;

        try {
            setSaving(true);
            const token = await getToken();

            const response = await fetch(`${API_BASE}/api/user/change-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.access}`,
                },
                body: JSON.stringify({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Ошибка смены пароля");
            }

            Toast.show({
                type: "success",
                text1: "Пароль успешно изменен",
            });

            // Сбросить форму пароля
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
        } catch (error) {
            console.error("Ошибка смены пароля:", error);
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error.message || "Попробуйте снова",
            });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={[styles.gradient, styles.center]}>
                <ActivityIndicator animating={true} color="#FFFFFF" size="large" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Заголовок профиля */}
                <View style={styles.header}>
                    <Ionicons name="settings" size={32} color="#fff" />
                    <Text style={styles.headerTitle}>Настройки профиля</Text>
                </View>

                {/* Объединенная секция: фото профиля + личная информация */}
                <View style={[styles.combinedSection, isCompact && styles.rowLayout]}>
                    {/* Фото профиля */}
                    <View style={[styles.profileSection, isCompact && styles.profileCompact]}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
                                <View style={styles.editAvatarOverlay}>
                                    <Ionicons name="camera" size={20} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.nameText}>{userData.name}</Text>
                            <Text style={styles.emailText}>{userData.email}</Text>
                        </View>
                    </View>

                    {/* Личная информация */}
                    <View style={[styles.section, isCompact && styles.formCompact, !isCompact && { marginTop: 24 }]}>
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>Личная информация</Text>

                            <FormField
                                title="name"
                                name="Имя"
                                value={formData.name}
                                handleChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, name: text }))
                                }
                                placeholder="Введите имя"
                                iconName="person-outline"
                                error={errors.name}
                            />
                            {errors.name && (
                                <Text style={styles.errorText}>{errors.name}</Text>
                            )}

                            <FormField
                                title="email"
                                name="Email"
                                value={formData.email}
                                handleChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, email: text }))
                                }
                                placeholder="Введите ваш email"
                                iconName="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}

                            <Button
                                mode="contained"
                                onPress={handleSaveProfile}
                                style={styles.saveButton}
                                loading={saving}
                                disabled={saving}
                                icon="content-save"
                            >
                                Сохранить изменения
                            </Button>
                        </View>
                    </View>
                </View>

                {/* Секция смены пароля */}
                <View style={[styles.section, isCompact && styles.rowLayout]}>
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Безопасность</Text>
                        <Text style={styles.sectionSubtitle}>Изменить пароль</Text>

                        <FormField
                            title="currentPassword"
                            name="Текущий пароль"
                            value={passwordData.currentPassword}
                            handleChangeText={(text) =>
                                setPasswordData((prev) => ({ ...prev, currentPassword: text }))
                            }
                            placeholder="Введите текущий пароль"
                            iconName="lock-closed-outline"
                            secureTextEntry={true}
                            error={passwordErrors.currentPassword}
                        />
                        {passwordErrors.currentPassword && (
                            <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
                        )}

                        <FormField
                            title="newPassword"
                            name="Новый пароль"
                            value={passwordData.newPassword}
                            handleChangeText={(text) =>
                                setPasswordData((prev) => ({ ...prev, newPassword: text }))
                            }
                            placeholder="Введите новый пароль"
                            iconName="lock-open-outline"
                            secureTextEntry={true}
                            error={passwordErrors.newPassword}
                        />
                        {passwordErrors.newPassword && (
                            <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
                        )}

                        <FormField
                            title="confirmPassword"
                            name="Подтвердите пароль"
                            value={passwordData.confirmPassword}
                            handleChangeText={(text) =>
                                setPasswordData((prev) => ({ ...prev, confirmPassword: text }))
                            }
                            placeholder="Подтвердите новый пароль"
                            iconName="checkmark-circle-outline"
                            secureTextEntry={true}
                            error={passwordErrors.confirmPassword}
                        />
                        {passwordErrors.confirmPassword && (
                            <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleChangePassword}
                            style={styles.passwordButton}
                            loading={saving}
                            disabled={saving}
                            icon="key-change"
                        >
                            Сменить пароль
                        </Button>
                    </View>
                </View>

                {/* Кнопка выхода */}
                <TouchableOpacity style={styles.logoutButton} onPress={showDialog}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Модальное окно выхода */}
            {
                visible && (
                    <View style={dialogStyles.overlay}>
                        <View style={dialogStyles.modal}>
                            <View style={dialogStyles.modalHeader}>
                                <Ionicons name="log-out-outline" size={32} color="#EF4444" />
                                <Text style={dialogStyles.title}>Выход из аккаунта</Text>
                            </View>

                            <Text style={dialogStyles.subtitle}>
                                Вы уверены, что хотите выйти из аккаунта?
                            </Text>

                            <View style={dialogStyles.buttons}>
                                <TouchableOpacity
                                    onPress={hideDialog}
                                    style={dialogStyles.cancelButton}
                                >
                                    <Text style={dialogStyles.cancelText}>Отмена</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    style={dialogStyles.confirmButton}
                                >
                                    <Ionicons name="log-out-outline" size={18} color="#fff" />
                                    <Text style={dialogStyles.confirmText}>Выйти</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }
        </LinearGradient >
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    center: {
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    combinedSection: {
        marginBottom: 24,
    },
    rowLayout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    profileSection: {
        marginBottom: 0,
    },
    profileCompact: {
        flex: 1,
        maxWidth: '35%',
    },
    formCompact: {
        flex: 2,
        maxWidth: '65%',
    },
    sectionContent: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    sectionTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
    },
    sectionSubtitle: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 16,
        marginBottom: 16,
    },
    profileHeader: {
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        height: '100%',
        justifyContent: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#6D28D9',
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    nameText: {
        color: "white",
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 5,
        textAlign: 'center',
    },
    emailText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#6D28D9",
    },
    passwordButton: {
        marginTop: 10,
        backgroundColor: "#10B981",
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginTop: 20,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
});

const dialogStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cancelText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#EF4444',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default SettingsScreen;