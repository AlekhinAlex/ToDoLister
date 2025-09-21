import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CollaborationStatus = ({ status, type }) => {
    const statusConfig = {
        1: { icon: 'time', color: '#F59E0B', label: 'Ожидание' },
        2: { icon: 'checkmark-circle', color: '#10B981', label: 'Принято' },
        3: { icon: 'close-circle', color: '#EF4444', label: 'Отклонено' }
    };

    const typeConfig = {
        1: { label: 'Любой может завершить' },
        2: { label: 'Все должны завершить' }
    };

    const config = statusConfig[status] || statusConfig[1];

    return (
        <View style={styles.container}>
            <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
                <Ionicons name={config.icon} size={14} color={config.color} />
                <Text style={[styles.statusText, { color: config.color }]}>
                    {config.label}
                </Text>
            </View>

            <View style={styles.typeBadge}>
                <Ionicons
                    name={type === 2 ? 'people' : 'person'}
                    size={12}
                    color="#3B82F6"
                />
                <Text style={styles.typeText}>
                    {typeConfig[type]?.label || typeConfig[1].label}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    typeText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
});

export default CollaborationStatus;