import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mode } from '../types';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const MODES: Mode[] = ['local', 'cloud', 'auto'];

export const ModelSelector = ({ mode, onChange }: Props) => {
  return (
    <View style={styles.wrapper}>
      {MODES.map(item => {
        const active = item === mode;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{item.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#f0f0f0',
  },
  label: {
    color: '#9a9a9a',
    fontWeight: '600',
    fontSize: 12,
  },
  labelActive: {
    color: '#111111',
  },
});
