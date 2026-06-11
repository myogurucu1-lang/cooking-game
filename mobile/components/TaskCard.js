import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from '../theme';
import { inferCategory } from '../utils/helpers';

export default function TaskCard({ task, cookName, isCompleted, onToggle }) {
  const category = inferCategory(task);

  return (
    <TouchableOpacity style={[styles.card, isCompleted && styles.cardCompleted]} onPress={onToggle}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.title, isCompleted && styles.titleCompleted]}>{task.title}</Text>
          <Text style={styles.trigger}>📍 {task.triggerAtStep}. adımda</Text>
        </View>
        {isCompleted && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={[styles.description, isCompleted && styles.descriptionCompleted]}>{task.description}</Text>
      <View style={styles.footer}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[category] || '#999' }]}>
          <Text style={styles.categoryText}>{CATEGORY_LABELS[category] || category}</Text>
        </View>
        <Text style={styles.duration}>⏱ {task.duration} dk</Text>
        <Text style={[styles.type, task.type === 'main' ? styles.typeMain : styles.typeSide]}>
          {task.type === 'main' ? 'ANA' : 'YAN'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompleted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.successBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  titleCompleted: {
    color: COLORS.textMuted,
  },
  trigger: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  descriptionCompleted: {
    color: COLORS.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  duration: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  type: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  typeMain: {
    backgroundColor: COLORS.primary,
    color: COLORS.textWhite,
  },
  typeSide: {
    backgroundColor: '#E0E0E0',
    color: '#666',
  },
});