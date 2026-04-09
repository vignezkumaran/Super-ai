import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
}

export const TypingIndicator = ({ resolvedTheme }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      );

    const animations = [pulse(dot1, 0), pulse(dot2, 120), pulse(dot3, 240)];
    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginVertical: 6,
    },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
});
