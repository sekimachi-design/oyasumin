import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';

const BODY = '#C8A064';
const HIGHLIGHT = '#FFD89E';
const BED = '#4A3A2A';
const PILLOW = '#5A4A3A';
const ARROW = '#F5E6D3';
const SW = 5.5;
const JOINT = 3.5;

type Props = {
  stretchId: string;
  step?: number;
};

export function StretchIllustration({ stretchId, step = 0 }: Props) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <Svg width={260} height={160} viewBox="0 0 260 160">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={HIGHLIGHT} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={HIGHLIGHT} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {renderPose(stretchId, step)}
      </Svg>
    </View>
  );
}

function Bed({ sittingMode }: { sittingMode?: boolean }) {
  if (sittingMode) {
    return (
      <G>
        <Rect x="30" y="118" width="200" height="18" rx="6" fill={BED} opacity={0.6} />
        <Rect x="35" y="106" width="40" height="16" rx="5" fill={PILLOW} opacity={0.5} />
      </G>
    );
  }
  return (
    <G>
      <Rect x="15" y="112" width="230" height="18" rx="6" fill={BED} opacity={0.6} />
      <Rect x="20" y="98" width="42" height="18" rx="6" fill={PILLOW} opacity={0.5} />
    </G>
  );
}

function Joint({ x, y, color }: { x: number; y: number; color?: string }) {
  return <Circle cx={x} cy={y} r={JOINT} fill={color || BODY} />;
}

function Head({ x, y, color }: { x: number; y: number; color?: string }) {
  return <Circle cx={x} cy={y} r={13} fill={color || BODY} opacity={0.9} />;
}

function Arrow({ d }: { d: string }) {
  return (
    <Path
      d={d}
      stroke={ARROW}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

function StretchGlow({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <Circle cx={cx} cy={cy} r={r} fill="url(#glow)" />;
}

function renderPose(id: string, step: number) {
  switch (id) {
    case 'neck': return <NeckStretch step={step} />;
    case 'shoulder': return <ShoulderRoll step={step} />;
    case 'twist': return <LyingTwist step={step} />;
    case 'kneehug': return <KneeHug step={step} />;
    case 'relax': return <RelaxPose step={step} />;
    default: return null;
  }
}

function NeckStretch({ step }: { step: number }) {
  const headX = step === 0 ? 115 : step === 1 ? 126 : 104;
  const headY = step === 0 ? 38 : 44;
  const neckColor = step > 0 ? HIGHLIGHT : BODY;

  return (
    <G>
      <Bed sittingMode />
      {step > 0 && <StretchGlow cx={headX} cy={60} r={30} />}

      <Path d="M115 115 Q130 114 160 115 L170 112"
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" fill="none" />
      <Joint x={170} y={112} />

      <Path d="M115 115 L115 62"
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
      <Joint x={115} y={115} />

      <Path d={`M115 62 L${headX} ${headY + 12}`}
        stroke={neckColor} strokeWidth={SW} strokeLinecap="round" />

      <Path d="M115 78 L95 100"
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
      <Joint x={95} y={100} />
      <Path d="M115 78 L138 98"
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
      <Joint x={138} y={98} />

      <Head x={headX} y={headY} />

      {step === 1 && (
        <G>
          <Arrow d="M140 28 Q148 38 142 52" />
          <Arrow d="M142 52 L145 46" />
          <Arrow d="M142 52 L137 47" />
        </G>
      )}
      {step === 2 && (
        <G>
          <Arrow d="M90 28 Q82 38 88 52" />
          <Arrow d="M88 52 L85 46" />
          <Arrow d="M88 52 L93 47" />
        </G>
      )}
    </G>
  );
}

function ShoulderRoll({ step }: { step: number }) {
  const shoulderY = step === 1 ? 56 : 65;
  const shoulderColor = step > 0 ? HIGHLIGHT : BODY;

  return (
    <G>
      <Bed sittingMode />
      {step > 0 && <StretchGlow cx={115} cy={65} r={35} />}

      <Path d="M115 115 Q130 114 160 115 L170 112"
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" fill="none" />
      <Joint x={170} y={112} />

      <Path d={`M115 115 L115 ${shoulderY}`}
        stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
      <Joint x={115} y={115} />

      <Head x={115} y={shoulderY - 24} />

      {step === 0 && (
        <G>
          <Path d={`M115 ${shoulderY + 8} L92 95`}
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={92} y={95} />
          <Path d={`M115 ${shoulderY + 8} L140 95`}
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={140} y={95} />
        </G>
      )}
      {step === 1 && (
        <G>
          <Path d={`M108 ${shoulderY} L88 70`}
            stroke={shoulderColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={88} y={70} color={shoulderColor} />
          <Path d="M88 70 L82 90"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={82} y={90} />

          <Path d={`M122 ${shoulderY} L142 70`}
            stroke={shoulderColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={142} y={70} color={shoulderColor} />
          <Path d="M142 70 L148 90"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={148} y={90} />

          <Arrow d="M80 58 L88 48 L96 58" />
          <Arrow d="M134 58 L142 48 L150 58" />
        </G>
      )}
      {step === 2 && (
        <G>
          <Path d={`M108 ${shoulderY} L90 82`}
            stroke={shoulderColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={90} y={82} color={shoulderColor} />
          <Path d="M90 82 L85 100"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={85} y={100} />

          <Path d={`M122 ${shoulderY} L140 82`}
            stroke={shoulderColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={140} y={82} color={shoulderColor} />
          <Path d="M140 82 L145 100"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={145} y={100} />

          <Path d="M78 60 Q72 78 82 92"
            stroke={ARROW} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray="5,4" />
          <Arrow d="M82 92 L78 86" />
          <Arrow d="M82 92 L86 87" />
          <Path d="M152 60 Q158 78 148 92"
            stroke={ARROW} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray="5,4" />
          <Arrow d="M148 92 L152 86" />
          <Arrow d="M148 92 L144 87" />
        </G>
      )}
    </G>
  );
}

function LyingTwist({ step }: { step: number }) {
  const twistColor = step > 0 ? HIGHLIGHT : BODY;

  return (
    <G>
      <Bed />

      {step === 0 && (
        <G>
          <Head x={42} y={92} />
          <Path d="M55 95 L130 95"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={95} />

          <Path d="M60 88 L40 72"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={40} y={72} />
          <Path d="M60 102 L40 112"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={40} y={112} />

          <Path d="M130 95 L138 72"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={138} y={72} />
          <Joint x={130} y={95} />
          <Path d="M138 72 L148 92"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={148} y={92} />
        </G>
      )}

      {step === 1 && (
        <G>
          <StretchGlow cx={130} cy={90} r={40} />
          <Head x={42} y={92} />
          <Path d="M55 95 L125 95"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={95} />

          <Path d="M60 88 L30 75"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={30} y={75} />
          <Path d="M60 102 L40 112"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={40} y={112} />

          <Path d="M125 95 L148 78"
            stroke={twistColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={125} y={95} color={twistColor} />
          <Joint x={148} y={78} color={twistColor} />
          <Path d="M148 78 L168 95"
            stroke={twistColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={168} y={95} />

          <Path d="M155 65 Q170 58 178 70"
            stroke={ARROW} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray="5,4" />
          <Arrow d="M178 70 L173 66" />

          <Arrow d="M50 85 L36 78" />
          <Path d="M54 82 Q44 72 34 76"
            stroke={ARROW} strokeWidth={2} fill="none" strokeDasharray="5,4" />
        </G>
      )}

      {step === 2 && (
        <G>
          <StretchGlow cx={115} cy={80} r={40} />
          <Head x={42} y={92} />
          <Path d="M55 95 L125 95"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={95} />

          <Path d="M60 88 L40 72"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={40} y={72} />
          <Path d="M60 102 L75 112"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={75} y={112} />

          <Path d="M125 95 L108 78"
            stroke={twistColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={125} y={95} color={twistColor} />
          <Joint x={108} y={78} color={twistColor} />
          <Path d="M108 78 L90 92"
            stroke={twistColor} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={90} y={92} />

          <Path d="M100 65 Q85 58 78 70"
            stroke={ARROW} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray="5,4" />
          <Arrow d="M78 70 L83 66" />

          <Arrow d="M50 85 L60 76" />
          <Path d="M48 82 Q56 72 64 76"
            stroke={ARROW} strokeWidth={2} fill="none" strokeDasharray="5,4" />
        </G>
      )}
    </G>
  );
}

function KneeHug({ step }: { step: number }) {
  return (
    <G>
      <Bed />

      {step === 0 && (
        <G>
          <Head x={42} y={92} />
          <Path d="M55 95 L150 95"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={95} />

          <Path d="M60 88 L38 76"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={38} y={76} />
          <Path d="M60 102 L38 112"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={38} y={112} />

          <Path d="M150 95 L175 98"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={150} y={95} />
          <Path d="M175 98 L195 102"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={175} y={98} />
          <Joint x={195} y={102} />
        </G>
      )}

      {step === 1 && (
        <G>
          <StretchGlow cx={125} cy={78} r={35} />
          <Head x={42} y={92} />
          <Path d="M55 95 L130 92"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={95} />

          <Path d="M60 88 L38 76"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={38} y={76} />

          <Path d="M130 92 L142 70"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={130} y={92} color={HIGHLIGHT} />
          <Joint x={142} y={70} color={HIGHLIGHT} />
          <Path d="M142 70 L130 58"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={130} y={58} />

          <Path d="M60 100 L90 82"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={90} y={82} />

          <Path d="M155 62 Q150 50 138 52"
            stroke={ARROW} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray="5,4" />
          <Arrow d="M138 52 L142 56" />
        </G>
      )}

      {step === 2 && (
        <G>
          <StretchGlow cx={110} cy={72} r={40} />
          <Head x={42} y={90} />
          <Path d="M55 93 L115 88"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={55} y={93} />

          <Path d="M115 88 L128 68"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={115} y={88} color={HIGHLIGHT} />
          <Joint x={128} y={68} color={HIGHLIGHT} />
          <Path d="M128 68 L115 55"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={115} y={55} />

          <Path d="M55 86 L78 72"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={78} y={72} color={HIGHLIGHT} />
          <Path d="M78 72 Q100 55 115 55"
            stroke={HIGHLIGHT} strokeWidth={SW} strokeLinecap="round" fill="none" />

          <Path d="M55 100 L38 112"
            stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
          <Joint x={38} y={112} />

          <Path d="M95 45 Q100 38 108 42"
            stroke={ARROW} strokeWidth={2} fill="none" strokeDasharray="5,4" />
        </G>
      )}
    </G>
  );
}

function RelaxPose({ step }: { step: number }) {
  const bodyOpacity = step === 2 ? 0.65 : 1;

  return (
    <G>
      <Bed />

      {step === 2 && (
        <G>
          <Circle cx={120} cy={88} r={50} fill="url(#glow)" />
          <Circle cx={120} cy={88} r={35} fill="url(#glow)" />
        </G>
      )}

      <G opacity={bodyOpacity}>
        <Head x={42} y={92} />
        <Path d="M55 95 L145 95"
          stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
        <Joint x={55} y={95} />

        <Path d="M60 88 L35 72"
          stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
        <Joint x={35} y={72} />
        <Path d="M60 102 L35 112"
          stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
        <Joint x={35} y={112} />

        <Path d="M145 95 L175 100"
          stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
        <Joint x={145} y={95} />
        <Joint x={175} y={100} />
        <Path d="M145 95 L170 112"
          stroke={BODY} strokeWidth={SW} strokeLinecap="round" />
        <Joint x={170} y={112} />
      </G>

      {step === 1 && (
        <G>
          <Arrow d="M185 95 L195 90" />
          <Arrow d="M180 108 L190 112" />
          <Path d="M195 90 Q200 85 198 78"
            stroke={ARROW} strokeWidth={2} fill="none" strokeDasharray="4,3" />
          <Path d="M190 112 Q196 115 196 120"
            stroke={ARROW} strokeWidth={2} fill="none" strokeDasharray="4,3" />

          <Path d="M165 92 Q168 86 166 80"
            stroke={HIGHLIGHT} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M150 92 Q152 86 150 80"
            stroke={HIGHLIGHT} strokeWidth={1.5} fill="none" opacity={0.4} />
          <Path d="M135 92 Q136 86 134 82"
            stroke={HIGHLIGHT} strokeWidth={1.5} fill="none" opacity={0.3} />
        </G>
      )}

      {step === 2 && (
        <G>
          <Path d="M80 70 L80 60"
            stroke={HIGHLIGHT} strokeWidth={1} opacity={0.3} />
          <Path d="M100 72 L100 62"
            stroke={HIGHLIGHT} strokeWidth={1} opacity={0.25} />
          <Path d="M120 70 L120 60"
            stroke={HIGHLIGHT} strokeWidth={1} opacity={0.2} />
          <Path d="M140 72 L140 64"
            stroke={HIGHLIGHT} strokeWidth={1} opacity={0.15} />
        </G>
      )}
    </G>
  );
}
