import { linearTiming, TransitionSeries } from '@remotion/transitions'
import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { focusPull } from '@/components/remocn/focus-pull'
import { MicroScaleFade } from '@/components/remocn/micro-scale-fade'
import { PerCharacterRise } from '@/components/remocn/per-character-rise'
import { pushThrough } from '@/components/remocn/push-through'
import { ShaderNeuroNoise } from '@/components/remocn/shader-neuro-noise'
import {
  type TerminalLine,
  TerminalSimulator,
} from '@/components/remocn/terminal-simulator'
import { whipPan } from '@/components/remocn/whip-pan'
import { CapabilityList } from '@/components/video/capability-list'
import { LogoSting } from '@/components/video/logo-sting'
import { PayoffLine } from '@/components/video/payoff-line'
import type { AgentLaunchData } from '@/data/agents'
import {
  GEIST_MONO,
  GEIST_SANS,
  geistMonoStack,
  geistPixelStack,
} from '@/fonts'

// remocn components resolve their type through these CSS variables — point them
// at the real Geist faces the web app uses.
const fontVariables = {
  '--font-geist-mono': GEIST_MONO,
  '--font-geist-sans': GEIST_SANS,
} as CSSProperties

export const AGENT_LAUNCH_FPS = 30
export const AGENT_LAUNCH_WIDTH = 1280
export const AGENT_LAUNCH_HEIGHT = 720

const INTRO_FRAMES = 118
const PAYOFF_FRAMES = 100
const CAPABILITIES_FRAMES = 172
const CTA_FRAMES = 128
const OUTRO_FRAMES = 112
const WHIP_PAN_FRAMES = 18
const FOCUS_PULL_FRAMES = 26
const PUSH_INTO_CTA_FRAMES = 22
const PUSH_INTO_OUTRO_FRAMES = 22

export const AGENT_LAUNCH_DURATION =
  INTRO_FRAMES +
  PAYOFF_FRAMES +
  CAPABILITIES_FRAMES +
  CTA_FRAMES +
  OUTRO_FRAMES -
  WHIP_PAN_FRAMES -
  FOCUS_PULL_FRAMES -
  PUSH_INTO_CTA_FRAMES -
  PUSH_INTO_OUTRO_FRAMES

const BACKGROUND = '#050505'
const BRAND_ACCENT = '#47a8ff'
const TEXT_PRIMARY = '#fafafa'
const TEXT_MUTED = '#a1a1aa'

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
  <SceneBase shaderOpacity={0.58} shaderSpeed={0.6}>
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
            text="New in the registry"
          />
        </div>
      </Sequence>
      <Sequence from={14} name="Agent name">
        <PerCharacterRise
          color={TEXT_PRIMARY}
          distance={44}
          fontSize={titleFontSize(agent.title)}
          fontWeight={700}
          text={agent.title}
        />
      </Sequence>
      <Sequence from={48} name="Category">
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

const CapabilitiesScene = ({ agent }: { agent: AgentLaunchData }) => (
  <SceneBase shaderOpacity={0.5} shaderSpeed={0.5}>
    <ScenePush zoomTo={1.04}>
      <Sequence from={4} name="Capabilities kicker">
        <div
          style={{
            inset: 0,
            position: 'absolute',
            transform: 'translateY(-150px)',
          }}
        >
          <MicroScaleFade
            color={TEXT_MUTED}
            fontSize={24}
            fontWeight={500}
            text="What it does"
          />
        </div>
      </Sequence>
      <Sequence from={16} name="Capability list">
        <CapabilityList
          accent={agent.accent}
          items={agent.capabilities ?? []}
          textColor={TEXT_PRIMARY}
        />
      </Sequence>
    </ScenePush>
  </SceneBase>
)

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
  </AbsoluteFill>
)

const OUTRO_ADDRESS_IN = 44
const OUTRO_ADDRESS_SETTLED = 60

const OutroAddress = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(
    frame,
    [OUTRO_ADDRESS_IN, OUTRO_ADDRESS_SETTLED],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const y = interpolate(
    frame,
    [OUTRO_ADDRESS_IN, OUTRO_ADDRESS_SETTLED],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  return (
    <div
      style={{
        color: TEXT_MUTED,
        fontFamily: geistMonoStack,
        fontSize: 26,
        fontWeight: 500,
        inset: 0,
        letterSpacing: '0.01em',
        opacity,
        position: 'absolute',
        textAlign: 'center',
        top: '50%',
        transform: `translateY(${104 + y}px)`,
      }}
    >
      evex.sh
    </div>
  )
}

// Closing brand card: the logo animates in (mark assembles + wordmark builds),
// with the product address settling underneath, then a generous hold.
const OutroScene = () => (
  <SceneBase shaderOpacity={0.5} shaderSpeed={0.5}>
    <ScenePush zoomTo={1.04}>
      <div
        style={{
          inset: 0,
          position: 'absolute',
          transform: 'translateY(-24px)',
        }}
      >
        <LogoSting
          accent={BRAND_ACCENT}
          fontFamily={geistPixelStack}
          unit={44}
        />
      </div>
      <OutroAddress />
    </ScenePush>
  </SceneBase>
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
        presentation={focusPull()}
        timing={linearTiming({ durationInFrames: FOCUS_PULL_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={CAPABILITIES_FRAMES}>
        <CapabilitiesScene agent={agent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={pushThrough()}
        timing={linearTiming({ durationInFrames: PUSH_INTO_CTA_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
        <CtaScene agent={agent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={pushThrough()}
        timing={linearTiming({ durationInFrames: PUSH_INTO_OUTRO_FRAMES })}
      />
      <TransitionSeries.Sequence durationInFrames={OUTRO_FRAMES}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
)
