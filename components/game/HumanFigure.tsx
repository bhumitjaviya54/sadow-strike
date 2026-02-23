import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HumanFigureProps {
  size: number;
  color: string;
  rotation: number;
  isMoving: boolean;
  isDead?: boolean;
  isPlayer?: boolean;
  gunColor?: string;
  animFrame?: number;
}

function HumanFigure({ size, color, rotation, isMoving, isDead, isPlayer, gunColor, animFrame = 0 }: HumanFigureProps) {
  const scale = size / 24;
  const headSize = 9 * scale;
  const neckW = 4 * scale;
  const neckH = 3 * scale;
  const torsoW = 14 * scale;
  const torsoH = 16 * scale;
  const shoulderW = 17 * scale;
  const shoulderH = 4 * scale;
  const upperArmW = 4.5 * scale;
  const upperArmH = 10 * scale;
  const forearmW = 3.8 * scale;
  const forearmH = 9 * scale;
  const handSize = 3.5 * scale;
  const hipW = 12 * scale;
  const hipH = 4 * scale;
  const upperLegW = 5 * scale;
  const upperLegH = 11 * scale;
  const lowerLegW = 4.2 * scale;
  const lowerLegH = 10 * scale;
  const bootW = 6 * scale;
  const bootH = 4 * scale;

  const gunBarrelL = 18 * scale;
  const gunBarrelW = 3 * scale;
  const gunBodyW = 10 * scale;
  const gunBodyH = 6 * scale;
  const gunGripW = 3.5 * scale;
  const gunGripH = 6 * scale;
  const gunMagW = 3 * scale;
  const gunMagH = 5 * scale;
  const gunStockW = 8 * scale;
  const gunStockH = 4 * scale;
  const gunScopeW = 5 * scale;
  const gunScopeH = 2.5 * scale;
  const gunSuppW = 6 * scale;
  const gunSuppH = 2.5 * scale;

  const skinColor = isPlayer ? '#D4A574' : '#C4956A';
  const skinShadow = isPlayer ? '#B8895E' : '#A87D55';
  const vestColor = isPlayer ? '#2D4A3E' : color;
  const vestAccent = isPlayer ? '#3D6352' : lightenColor(color, 15);
  const pantsColor = isPlayer ? '#2C3E50' : '#3D2B1F';
  const pantsShadow = isPlayer ? '#1E2D3A' : '#2E1F15';
  const bootColor = isPlayer ? '#1A1A1A' : '#2A2018';
  const beltColor = '#4A3828';
  const gearColor = isPlayer ? '#556B2F' : '#4A3520';

  const walkCycle = isMoving ? Math.sin(animFrame * 0.35) : 0;
  const walkCycle2 = isMoving ? Math.sin(animFrame * 0.35 + Math.PI) : 0;
  const armSwing = isMoving ? Math.sin(animFrame * 0.35) * 3 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(animFrame * 0.7)) * 1.2 : 0;

  const figW = size * 2.6;
  const figH = size * 2.6;
  const cx = figW / 2;
  const cy = figH / 2;

  if (isDead) {
    return (
      <View style={[styles.figureRoot, { width: figW, height: figW * 0.5 }]}>
        <View style={{
          position: 'absolute' as const,
          left: size * 0.2,
          top: size * 0.15,
          width: torsoH + upperLegH,
          height: torsoW * 0.8,
          backgroundColor: vestColor,
          borderRadius: 3,
          opacity: 0.55,
        }} />
        <View style={{
          position: 'absolute' as const,
          left: size * 0.05,
          top: size * 0.12,
          width: headSize * 0.85,
          height: headSize * 0.85,
          borderRadius: headSize * 0.43,
          backgroundColor: skinColor,
          opacity: 0.55,
        }} />
        <View style={{
          position: 'absolute' as const,
          left: size * 0.2 + torsoH + upperLegH - 2,
          top: size * 0.08,
          width: lowerLegH * 0.7,
          height: upperLegW * 0.8,
          backgroundColor: pantsColor,
          borderRadius: 2,
          opacity: 0.5,
        }} />
        <View style={{
          position: 'absolute' as const,
          left: size * 0.2 + torsoH + upperLegH - 2,
          top: size * 0.22,
          width: lowerLegH * 0.7,
          height: upperLegW * 0.8,
          backgroundColor: pantsColor,
          borderRadius: 2,
          opacity: 0.5,
        }} />
        <View style={{
          position: 'absolute' as const,
          left: size * 0.5,
          top: size * 0.28,
          width: 10 * scale,
          height: 3 * scale,
          backgroundColor: '#6B0000',
          borderRadius: 2,
          opacity: 0.6,
        }} />
        <View style={{
          position: 'absolute' as const,
          left: size * 0.8,
          top: size * 0.05,
          width: gunBarrelL * 0.6,
          height: gunBarrelW,
          backgroundColor: gunColor ?? '#333',
          borderRadius: 1,
          opacity: 0.5,
        }} />
      </View>
    );
  }

  return (
    <View style={[styles.figureRoot, {
      width: figW,
      height: figH,
      transform: [{ rotate: `${rotation + Math.PI / 2}rad` }],
    }]}>

      <View style={{
        position: 'absolute' as const,
        left: cx - upperLegW / 2 - 3 * scale + walkCycle * 4,
        top: cy + torsoH / 2 + hipH - 1,
        width: upperLegW,
        height: upperLegH,
        backgroundColor: pantsColor,
        borderRadius: upperLegW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - upperLegW / 2 - 3 * scale + walkCycle * 4 + 0.5 * scale,
        top: cy + torsoH / 2 + hipH + upperLegH - 3,
        width: lowerLegW,
        height: lowerLegH,
        backgroundColor: pantsShadow,
        borderRadius: lowerLegW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - bootW / 2 - 3 * scale + walkCycle * 4,
        top: cy + torsoH / 2 + hipH + upperLegH + lowerLegH - 5,
        width: bootW,
        height: bootH,
        backgroundColor: bootColor,
        borderRadius: 2,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx - upperLegW / 2 + 3 * scale + walkCycle2 * 4,
        top: cy + torsoH / 2 + hipH - 1,
        width: upperLegW,
        height: upperLegH,
        backgroundColor: pantsColor,
        borderRadius: upperLegW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - upperLegW / 2 + 3 * scale + walkCycle2 * 4 + 0.5 * scale,
        top: cy + torsoH / 2 + hipH + upperLegH - 3,
        width: lowerLegW,
        height: lowerLegH,
        backgroundColor: pantsShadow,
        borderRadius: lowerLegW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - bootW / 2 + 3 * scale + walkCycle2 * 4,
        top: cy + torsoH / 2 + hipH + upperLegH + lowerLegH - 5,
        width: bootW,
        height: bootH,
        backgroundColor: bootColor,
        borderRadius: 2,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx - hipW / 2,
        top: cy + torsoH / 2 - 2,
        width: hipW,
        height: hipH,
        backgroundColor: beltColor,
        borderRadius: 2,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx - torsoW / 2,
        top: cy - torsoH / 2 - bodyBob,
        width: torsoW,
        height: torsoH,
        backgroundColor: vestColor,
        borderRadius: 3,
      }}>
        <View style={{
          position: 'absolute' as const,
          left: 1.5 * scale,
          top: 2 * scale,
          width: torsoW - 3 * scale,
          height: torsoH * 0.35,
          backgroundColor: vestAccent,
          borderRadius: 2,
          opacity: 0.6,
        }} />
        {isPlayer && (
          <>
            <View style={{
              position: 'absolute' as const,
              left: torsoW * 0.15,
              top: torsoH * 0.45,
              width: 3.5 * scale,
              height: 4 * scale,
              backgroundColor: gearColor,
              borderRadius: 1,
            }} />
            <View style={{
              position: 'absolute' as const,
              left: torsoW * 0.55,
              top: torsoH * 0.45,
              width: 3.5 * scale,
              height: 4 * scale,
              backgroundColor: gearColor,
              borderRadius: 1,
            }} />
            <View style={{
              position: 'absolute' as const,
              left: torsoW * 0.35,
              top: torsoH * 0.65,
              width: 4 * scale,
              height: 3 * scale,
              backgroundColor: '#8B7355',
              borderRadius: 1,
            }} />
          </>
        )}
      </View>

      <View style={{
        position: 'absolute' as const,
        left: cx - shoulderW / 2,
        top: cy - torsoH / 2 - 1 - bodyBob,
        width: shoulderW,
        height: shoulderH,
        backgroundColor: vestColor,
        borderRadius: shoulderH / 2,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx - shoulderW / 2 - upperArmW / 2 + 1,
        top: cy - torsoH / 2 + shoulderH - 2 + armSwing - bodyBob,
        width: upperArmW,
        height: upperArmH,
        backgroundColor: vestColor,
        borderRadius: upperArmW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - shoulderW / 2 - forearmW / 2 + 1.5,
        top: cy - torsoH / 2 + shoulderH + upperArmH - 5 + armSwing - bodyBob,
        width: forearmW,
        height: forearmH,
        backgroundColor: skinColor,
        borderRadius: forearmW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - shoulderW / 2 - handSize / 2 + 1.5,
        top: cy - torsoH / 2 + shoulderH + upperArmH + forearmH - 8 + armSwing - bodyBob,
        width: handSize,
        height: handSize,
        borderRadius: handSize / 2,
        backgroundColor: skinShadow,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx + shoulderW / 2 - upperArmW / 2 - 1,
        top: cy - torsoH / 2 + shoulderH - 2 - armSwing - bodyBob,
        width: upperArmW,
        height: upperArmH,
        backgroundColor: vestColor,
        borderRadius: upperArmW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx + shoulderW / 2 - forearmW / 2 - 0.5,
        top: cy - torsoH / 2 + shoulderH + upperArmH - 5 - armSwing - bodyBob,
        width: forearmW,
        height: forearmH,
        backgroundColor: skinColor,
        borderRadius: forearmW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx + shoulderW / 2 - handSize / 2 - 0.5,
        top: cy - torsoH / 2 + shoulderH + upperArmH + forearmH - 8 - armSwing - bodyBob,
        width: handSize,
        height: handSize,
        borderRadius: handSize / 2,
        backgroundColor: skinShadow,
      }} />

      <View style={{
        position: 'absolute' as const,
        left: cx - gunBarrelW / 2,
        top: cy - torsoH / 2 - gunBarrelL + 4 * scale - bodyBob,
        width: gunBarrelW,
        height: gunBarrelL,
        backgroundColor: gunColor ?? '#2A2A2A',
        borderRadius: gunBarrelW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - gunSuppW / 2,
        top: cy - torsoH / 2 - gunBarrelL + 1 * scale - bodyBob,
        width: gunSuppW,
        height: gunSuppH,
        backgroundColor: '#1A1A1A',
        borderRadius: gunSuppH / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - gunBodyW / 2,
        top: cy - torsoH / 2 + 1 * scale - bodyBob,
        width: gunBodyW,
        height: gunBodyH,
        backgroundColor: gunColor ?? '#333',
        borderRadius: 2,
      }}>
        <View style={{
          position: 'absolute' as const,
          top: 1,
          left: 1,
          right: 1,
          height: gunBodyH * 0.3,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }} />
      </View>
      <View style={{
        position: 'absolute' as const,
        left: cx + gunBodyW / 2 - gunGripW,
        top: cy - torsoH / 2 + 1 * scale + gunBodyH - 2 - bodyBob,
        width: gunGripW,
        height: gunGripH,
        backgroundColor: '#1E1E1E',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - gunMagW / 2 + 1,
        top: cy - torsoH / 2 + 1 * scale + gunBodyH - 1 - bodyBob,
        width: gunMagW,
        height: gunMagH,
        backgroundColor: '#252525',
        borderRadius: 1,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - gunBodyW / 2 - gunStockW + 2,
        top: cy - torsoH / 2 + 2 * scale - bodyBob,
        width: gunStockW,
        height: gunStockH,
        backgroundColor: '#3D2B1A',
        borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - gunScopeW / 2,
        top: cy - torsoH / 2 - 1 * scale - bodyBob,
        width: gunScopeW,
        height: gunScopeH,
        backgroundColor: '#111',
        borderRadius: gunScopeH / 2,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
      }}>
        <View style={{
          position: 'absolute' as const,
          left: 0.5,
          top: gunScopeH * 0.2,
          width: gunScopeH * 0.5,
          height: gunScopeH * 0.5,
          borderRadius: gunScopeH * 0.25,
          backgroundColor: '#2288FF',
          opacity: 0.4,
        }} />
      </View>

      <View style={{
        position: 'absolute' as const,
        left: cx - neckW / 2,
        top: cy - torsoH / 2 - neckH + 1 - bodyBob,
        width: neckW,
        height: neckH,
        backgroundColor: skinShadow,
        borderRadius: neckW / 2,
      }} />
      <View style={{
        position: 'absolute' as const,
        left: cx - headSize / 2,
        top: cy - torsoH / 2 - neckH - headSize + 3 - bodyBob,
        width: headSize,
        height: headSize,
        borderRadius: headSize / 2,
        backgroundColor: skinColor,
      }}>
        <View style={{
          position: 'absolute' as const,
          left: headSize * 0.2,
          top: headSize * 0.35,
          width: 1.5 * scale,
          height: 1.5 * scale,
          borderRadius: 1 * scale,
          backgroundColor: '#2C1810',
        }} />
        <View style={{
          position: 'absolute' as const,
          right: headSize * 0.2,
          top: headSize * 0.35,
          width: 1.5 * scale,
          height: 1.5 * scale,
          borderRadius: 1 * scale,
          backgroundColor: '#2C1810',
        }} />
        <View style={{
          position: 'absolute' as const,
          left: headSize * 0.35,
          top: headSize * 0.58,
          width: headSize * 0.3,
          height: 1 * scale,
          backgroundColor: skinShadow,
          borderRadius: 1,
        }} />
      </View>

      {isPlayer ? (
        <>
          <View style={{
            position: 'absolute' as const,
            left: cx - headSize / 2 - 1.5 * scale,
            top: cy - torsoH / 2 - neckH - headSize - 1 * scale - bodyBob,
            width: headSize + 3 * scale,
            height: headSize * 0.5,
            backgroundColor: '#1C2E1C',
            borderTopLeftRadius: headSize * 0.35,
            borderTopRightRadius: headSize * 0.35,
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: 1,
          }} />
          <View style={{
            position: 'absolute' as const,
            left: cx - headSize / 2 - 2.5 * scale,
            top: cy - torsoH / 2 - neckH - headSize * 0.55 - bodyBob,
            width: headSize + 5 * scale,
            height: 2.5 * scale,
            backgroundColor: '#1C2E1C',
            borderRadius: 1,
          }} />
        </>
      ) : (
        <>
          <View style={{
            position: 'absolute' as const,
            left: cx - headSize / 2 - 1 * scale,
            top: cy - torsoH / 2 - neckH - headSize + 1 - bodyBob,
            width: headSize + 2 * scale,
            height: headSize * 0.85,
            backgroundColor: '#1A1A1A',
            borderRadius: headSize * 0.3,
            opacity: 0.85,
          }} />
          <View style={{
            position: 'absolute' as const,
            left: cx - headSize * 0.35,
            top: cy - torsoH / 2 - neckH - headSize * 0.55 - bodyBob,
            width: headSize * 0.7,
            height: headSize * 0.25,
            backgroundColor: '#333',
            borderRadius: 2,
            opacity: 0.7,
          }} />
        </>
      )}

      {isPlayer && (
        <View style={{
          position: 'absolute' as const,
          left: cx - 1.5 * scale,
          top: cy - torsoH / 2 - neckH - headSize * 0.3 - bodyBob,
          width: 3 * scale,
          height: 2 * scale,
          backgroundColor: '#333',
          borderRadius: 1,
          opacity: 0.7,
        }} />
      )}

      <View style={{
        position: 'absolute' as const,
        left: cx - hipW / 2 - 2 * scale,
        top: cy + torsoH / 2 - 3,
        width: 3 * scale,
        height: 5 * scale,
        backgroundColor: '#5C4A32',
        borderRadius: 1.5,
      }} />
    </View>
  );
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default React.memo(HumanFigure);

const styles = StyleSheet.create({
  figureRoot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
