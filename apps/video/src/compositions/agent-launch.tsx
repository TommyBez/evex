import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono'
import { linearTiming, TransitionSeries } from '@remotion/transitions'
import type { CSSProperties } from 'react'
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion'
import { focusPull } from '@/components/remocn/focus-pull'
import { MicroScaleFade } from '@/components/remocn/micro-scale-fade'
import { pushThrough } from '@/components/remocn/push-through'
import { ShaderNeuroNoise } from '@/components/remocn/shader-neuro-noise'
import { SoftBlurIn } from '@/components/remocn/soft-blur-in'
import {
  type TerminalLine,
  TerminalSimulator,
} from '@/components/remocn/terminal-simulator'
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

const INTRO_FRAMES = 170
const PAYOFF_FRAMES = 120
const CTA_FRAMES = 180
const FOCUS_PULL_FRAMES = 28
const PUSH_THROUGH_FRAMES = 26

export const AGENT_LAUNCH_DURATION =
  INTRO_FRAMES +
  PAYOFF_FRAMES +
  CTA_FRAMES -
  FOCUS_PULL_FRAMES -
  PUSH_THROUGH_FRAMES

const BACKGROUND = '#050505'
const TEXT_PRIMARY = '#fafafa'
const TEXT_MUTED = '#a1a1aa'
const TEXT_FAINT = '#71717a'

const titleFontSize = (title: string): number => {
  if (title.length <= 16) {
    return 84
  }
  if (title.length <= 22) {
    return 68
  }
  return 58
}

const SceneBase = ({
  children,
  shaderOpacity,
}: {
  children: React.ReactNode
  shaderOpacity: number
}) => (
  <AbsoluteFill style={{ backgroundColor: BACKGROUND }}>
    <AbsoluteFill style={{ opacity: shaderOpacity }}>
      <ShaderNeuroNoise speed={0.35} />
    </AbsoluteFill>
    {children}
  </AbsoluteFill>
)

const IntroScene = ({ agent }: { agent: AgentLaunchData }) => (
  <SceneBase shaderOpacity={0.55}>
    <Sequence from={8} name="Kicker">
      <div
        style={{
          inset: 0,
          position: 'absolute',
          transform: 'translateY(-104px)',
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
    <Sequence from={30} name="Agent name">
      <SoftBlurIn
        color={TEXT_PRIMARY}
        fontSize={titleFontSize(agent.title)}
        fontWeight={600}
        text={agent.title}
      />
    </Sequence>
    <Sequence from={78} name="Category">
      <div
        style={{
          inset: 0,
          position: 'absolute',
          transform: 'translateY(96px)',
        }}
      >
        <MicroScaleFade
          color={agent.accent}
          fontSize={24}
          fontWeight={500}
          text={agent.category}
        />
      </div>
    </Sequence>
  </SceneBase>
)

const PayoffScene = ({ agent }: { agent: AgentLaunchData }) => (
  <SceneBase shaderOpacity={0.35}>
    <Sequence from={6} name="Payoff line">
      <PayoffLine
        after={agent.payoff.after}
        before={agent.payoff.before}
        highlight={agent.payoff.highlight}
        highlightColor={agent.accent}
      />
    </Sequence>
  </SceneBase>
)

const CTA_CAPTION_IN = 118
const CTA_CAPTION_SETTLED = 140

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
  { delay: 10, text: '✔ Checking registry.', type: 'log' },
  { delay: 6, text: '✔ Installing dependencies.', type: 'log' },
  { delay: 6, text: `✔ Created ${agent.fileCount} files.`, type: 'log' },
  { delay: 12, text: `${agent.title} is ready.`, type: 'success' },
]

const CtaScene = ({ agent }: { agent: AgentLaunchData }) => (
  <AbsoluteFill style={{ backgroundColor: BACKGROUND }}>
    <TerminalSimulator
      chunkSize={2}
      lines={installLines(agent)}
      title="~/my-app"
    />
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
        presentation={focusPull()}
        timing={linearTiming({ durationInFrames: FOCUS_PULL_FRAMES })}
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
