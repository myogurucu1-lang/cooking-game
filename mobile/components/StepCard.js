import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function StepCard({ stepObj, index, isCompleted, isTyping, onToggle }) {
  const stepNum = stepObj.step || index + 1;

  return (
    <TouchableOpacity 
      style={[styles.card, isCompleted && styles.cardCompleted, isTyping && styles.cardTyping]}
      onPress={() => !isTyping && onToggle(stepNum)}
      disabled={isTyping}
    >
      <View style={styles.header}>
        <View style={[styles.number, isCompleted && styles.numberCompleted]}>
          <Text style={styles.numberText}>{isCompleted ? '✓' : stepNum}</Text>
        </View>
        <View style={styles.meta}>
          {stepObj.duration && <Text style={styles.duration}>{stepObj.duration}</Text>}
          {stepObj.heat && <Text style={styles.heat}>{stepObj.heat}</Text>}
        </View>
      </View>
      <Text style={[styles.instruction, isCompleted && styles.instructionCompleted]}>
        {stepObj.instruction}{isTyping ? '|' : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompleted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.successBorder,
  },
  cardTyping: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberCompleted: {
    backgroundColor: COLORS.success,
  },
  numberText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  duration: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 10,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heat: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  instructionCompleted: {
    color: COLORS.textMuted,
  },
});