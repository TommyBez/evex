import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono'
import { linearTiming, TransitionSeries } from '@remotion/transitions'
import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { MicroScaleFade } from '@/components/remocn/micro-scale-fade'
import { PerCharacterRise } from '@/components/remocn/per-character-rise'
import { pushThrough } from '@/components/remocn/push-through'
import { ShaderNeuroNoise } from '@/components/remocn/shader-neuro-noise'
import {
  type TerminalLine,
  TerminalSimulator,
} from '@/components/remocn/terminal-simulator'
import { whipPan } from '@/components/remocn/whip-pan'
import { PayoffLine } from '@/components/video/payoff-line'
import type { AgentLaunchData } from '@/data/agents'

const { fontFamily: sansFamily } = loadInter()
const { fontFamily: monoFamily } = loadJetBrainsMono()

// remocn components resolve their type through these CSS variables.
const fontVariables = {
  '--font-geist-mono': monoFamily,
  '--font-geist-sans': sansFamily,
} as CSSProperties

export const AGENT_LAUNCH_FPS = 30
export const AGENT_LAUNCH_WIDTH = 1280
export const AGENT_LAUNCH_HEIGHT = 720

const INTRO_FRAMES = 120
const PAYOFF_FRAMES = 96
const CTA_FRAMES = 150
const WHIP_PAN_FRAMES = 18
const PUSH_THROUGH_FRAMES = 22

export const AGENT_LAUNCH_DURATION =
  INTRO_FRAMES +
  PAYOFF_FRAMES +
  CTA_FRAMES -
  WHIP_PAN_FRAMES -
  PUSH_THROUGH_FRAMES

const BACKGROUND = '#050505'
const TEXT_PRIMARY = '#fafafa'
const TEXT_MUTED = '#a1a1aa'
const TEXT_FAINT = '#71717a'

const titleFontSize = (title: string): number => {
  if (title.length <= 16) {
    return 96
  }
  if (title.length <= 22) {
    return 78
  }
  return 64
}

// Slow push-in across the whole scene keeps every hold alive.
const ScenePush = ({
  children,
  zoomTo,
}: {
  children: ReactNode
  zoomTo: number
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [1, zoomTo])
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  )
}

const SceneBase = ({
  children,
  shaderOpacity,
  shaderSpeed,
}: {
  children: ReactNode
  shaderOpacity: number
  shaderSpeed: number
}) => (
  <AbsoluteFill style={{ backgroundColor: BACKGROUND }}>
    <AbsoluteFill style={{ opacity: shaderOpacity }}>
      <ShaderNeuroNoise speed={shaderSpeed} />
    </AbsoluteFill>
    {children}
  </AbsoluteFill>
)

const IntroScene = ({ agent }: { agent: AgentLaunchData }) => (
  <SceneBase shaderOpacity={0.6} shaderSpeed={0.6}>
    <ScenePush zoomTo={1.06}>
      <Sequence from={4} name="Kicker">
        <div
          style={{
            inset: 0,
            position: 'absolute',
            transform: 'translateY(-112px)',
          }}
        >
          <MicroScaleFade
            color={TEXT_MUTED}
            fontSize={26}
            fontWeight={500}
            text="New in the evex registry"
          />
        </div>
      </Sequence>
      <Sequence from={16} name="Agent name">
        <PerCharacterRise
          color={TEXT_PRIMARY}
          distance={44}
          fontSize={titleFontSize(agent.title)}
          fontWeight={700}
          text={agent.title}
        />
      </Sequence>
      <Sequence from={50} name="Category">
        <div
          style={{
            inset: 0,
            position: 'absolute',
            transform: 'translateY(104px)',
          }}
        >
          <MicroScaleFade
            color={agent.accent}
            fontSize={24}
            fontWeight={600}
            text={agent.category}
          />
        </div>
      </Sequence>
    </ScenePush>
  </SceneBase>
)

const PayoffScene = ({ agent }: { agent: AgentLaunchData }) => (
  <SceneBase shaderOpacity={0.4} shaderSpeed={0.45}>
    <ScenePush zoomTo={1.05}>
      <Sequence from={2} name="Payoff line">
        <PayoffLine
          after={agent.payoff.after}
          before={agent.payoff.before}
          fontSize={54}
          fontWeight={700}
          highlight={agent.payoff.highlight}
          highlightColor={agent.accent}
        />
      </Sequence>
    </ScenePush>
  </SceneBase>
)

const CTA_CAPTION_IN = 92
const CTA_CAPTION_SETTLED = 110

const CtaCaption = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(
    frame,
    [CTA_CAPTION_IN, CTA_CAPTION_SETTLED],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  return (
    <div
      style={{
        bottom: 44,
        color: TEXT_FAINT,
        fontFamily: `${sansFamily}, -apple-system, sans-serif`,
        fontSize: 22,
        fontWeight: 500,
        left: 0,
        opacity,
        position: 'absolute',
        right: 0,
        textAlign: 'center',
      }}
    >
      Browse every agent at{' '}
      <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>evex.sh</span>
    </div>
  )
}

const installLines = (agent: AgentLaunchData): TerminalLine[] => [
  {
    text: `npx shadcn@latest add @evex/${agent.slug}`,
    type: 'command',
  },
  { delay: 8, text: '✔ Checking registry.', type: 'log' },
  { delay: 4, text: '✔ Installing dependencies.', type: 'log' },
  { delay: 4, text: `✔ Created ${agent.fileCount} files.`, type: 'log' },
  { delay: 8, text: `${agent.title} is ready.`, type: 'success' },
]

const CtaScene = ({ agent }: { agent: AgentLaunchData }) => (
  <AbsoluteFill style={{ backgroundColor: BACKGROUND }}>
    <ScenePush zoomTo={1.03}>
      <TerminalSimulator
        chunkSize={3}
        lines={installLines(agent)}
        title="~/my-app"
      />
    </ScenePush>
    <CtaCaption />
  </AbsoluteFill>
)

export const AgentLaunch = ({ agent }: { agent: AgentLaunchData }) => (
  <AbsoluteFill style={fontVariables}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={INTRO_FRAMES}>
        <IntroScene agent={agent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={whipPan({ direction: 'left' })}
        timing={linearTiming({ durationInFrames: WHIP_PAN_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={PAYOFF_FRAMES}>
        <PayoffScene agent={agent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={pushThrough()}
        timing={linearTiming({ durationInFrames: PUSH_THROUGH_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
        <CtaScene agent={agent} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
)
