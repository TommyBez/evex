import { Composition } from 'remotion'
import {
  AGENT_LAUNCH_DURATION,
  AGENT_LAUNCH_FPS,
  AGENT_LAUNCH_HEIGHT,
  AGENT_LAUNCH_WIDTH,
  AgentLaunch,
} from './compositions/agent-launch'
import { AGENTS } from './data/agents'

export const RemotionRoot = () => (
  <>
    {AGENTS.map((agent) => (
      <Composition
        component={AgentLaunch}
        defaultProps={{ agent }}
        durationInFrames={AGENT_LAUNCH_DURATION}
        fps={AGENT_LAUNCH_FPS}
        height={AGENT_LAUNCH_HEIGHT}
        id={agent.slug}
        key={agent.slug}
        width={AGENT_LAUNCH_WIDTH}
      />
    ))}
  </>
)
