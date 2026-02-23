import React, { useRef, useState, useCallback } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/color';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
}

const JOYSTICK_SIZE = 120;
const STICK_SIZE = 48;
const MAX_DIST = 40;

function VirtualJoystick({ onMove, size = JOYSTICK_SIZE }: VirtualJoystickProps) {
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setStickPos({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gs) => {
        const rawX = gs.dx;
        const rawY = gs.dy;
        const dist = Math.sqrt(rawX * rawX + rawY * rawY);
        const clampedDist = Math.min(dist, MAX_DIST);
        if (dist > 3) {
          const angle = Math.atan2(rawY, rawX);
          const nx = Math.cos(angle) * clampedDist;
          const ny = Math.sin(angle) * clampedDist;
          setStickPos({ x: nx, y: ny });
          onMoveRef.current(nx / MAX_DIST, ny / MAX_DIST);
        } else {
          setStickPos({ x: 0, y: 0 });
          onMoveRef.current(0, 0);
        }
      },
      onPanResponderRelease: () => {
        setStickPos({ x: 0, y: 0 });
        onMoveRef.current(0, 0);
      },
      onPanResponderTerminate: () => {
        setStickPos({ x: 0, y: 0 });
        onMoveRef.current(0, 0);
      },
    })
  ).current;

  return (
    <View
      style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.ring, { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }]} />
      <View
        style={[
          styles.stick,
          {
            width: STICK_SIZE,
            height: STICK_SIZE,
            borderRadius: STICK_SIZE / 2,
            transform: [{ translateX: stickPos.x }, { translateY: stickPos.y }],
          },
        ]}
      />
    </View>
  );
}

export default React.memo(VirtualJoystick);

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stick: {
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
