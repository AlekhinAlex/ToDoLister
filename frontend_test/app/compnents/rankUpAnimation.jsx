import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RankUpAnimation = ({ visible, oldRank, newRank, onComplete }) => {
    const [scaleValue] = useState(new Animated.Value(0.5));
    const [opacityValue] = useState(new Animated.Value(0));
    const [textScale] = useState(new Animated.Value(0));
    const [glowScale] = useState(new Animated.Value(1));

    useEffect(() => {
        if (visible) {
            // Основная анимация появления и исчезновения
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(opacityValue, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleValue, {
                        toValue: 1,
                        friction: 5,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(textScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.elastic(1.5),
                    useNativeDriver: true,
                }),
                Animated.delay(2500),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onComplete();
            });

            // Анимация свечения ранга
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowScale, {
                        toValue: 1.3,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
                style={styles.gradient}
            >
                <Animated.View style={[styles.container, {
                    opacity: opacityValue,
                    transform: [{ scale: scaleValue }],
                }]}>
                    <Text style={styles.congratsText}>Поздравляем!</Text>

                    <View style={styles.rankContainer}>
                        {/* Старый ранг */}
                        <View style={styles.rankBox}>
                            <Text style={styles.rankLabel}>Старый ранг</Text>
                            {oldRank?.image && <Image source={{ uri: oldRank.image }} style={styles.rankImage} />}
                            <Text style={styles.rankName}>{oldRank?.name || 'Новичок'}</Text>
                        </View>

                        <Text style={styles.arrow}>➔</Text>

                        {/* Новый ранг с сиянием */}
                        <View style={styles.rankBox}>
                            <Text style={styles.rankLabel}>Новый ранг</Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Animated.View style={[
                                    styles.glowCircle,
                                    { transform: [{ scale: glowScale }] }
                                ]} />
                                {newRank?.image && <Image source={{ uri: newRank.image }} style={styles.rankImage} />}
                            </View>
                            <Text style={[styles.rankName, styles.newRankName]}>{newRank?.name}</Text>
                        </View>
                    </View>

                    <Animated.View style={{ transform: [{ scale: textScale }] }}>
                        <Text style={styles.levelUpText}>Уровень повышен!</Text>
                    </Animated.View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'rgba(65, 105, 209, 1)',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '90%',
        maxWidth: 400,
        borderColor: '#fff',
        borderWidth: 1,
    },
    congratsText: {
        color: '#FFD700',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    rankBox: {
        alignItems: 'center',
        padding: 15,
        minWidth: 120,
    },
    rankLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    rankImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        zIndex: 2,
    },
    glowCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD70040',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        zIndex: 1,
    },
    rankName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    newRankName: {
        color: '#FFD700',
    },
    arrow: {
        color: '#fff',
        fontSize: 30,
        marginHorizontal: 10,
    },
    levelUpText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});

export default RankUpAnimation;
