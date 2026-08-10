import { defineEval } from 'eve/evals'
import { includes, satisfies } from 'eve/evals/expect'
import {
  buildVerificationCommand,
  resolveVerificationOrigin,
} from '../agent/tools/verify_vercel_preview'

const BROKERED_ROUTE_AUTH_HEADER = 'authorization: brokeredeveauthorization'

const brokeredCommand = buildVerificationCommand({
  message: 'Verify the upgraded Eve deployment.',
  origin: 'https://preview.example.com',
  streamMaxSeconds: 15,
  useBypassHeader: true,
  useRouteAuthorizationHeader: true,
})

const anonymousCommand = buildVerificationCommand({
  message: 'Verify the upgraded Eve deployment.',
  origin: 'https://preview.example.com',
  streamMaxSeconds: 15,
  useBypassHeader: false,
  useRouteAuthorizationHeader: false,
})

const healthCommand =
  brokeredCommand
    .split('\n')
    .find((line) => line.startsWith('HEALTH_RESPONSE=')) ?? ''
const sessionCommand =
  brokeredCommand
    .split('\n')
    .find((line) => line.startsWith('SESSION_RESPONSE=')) ?? ''
const healthStatusPredicate =
  brokeredCommand
    .split('\n')
    .find((line) => line.startsWith('HEALTH_OK=')) ?? ''
const sessionStatusPredicate =
  brokeredCommand
    .split('\n')
    .find((line) => line.startsWith('SESSION_OK=')) ?? ''

const curlCommandLines = brokeredCommand
  .split('\n')
  .filter((line) => line.includes('curl '))
const curlCommandsDisableUserConfig =
  curlCommandLines.length === 3 &&
  curlCommandLines.every((line) => line.includes('curl --disable '))

function rejectsVerificationOrigin(
  value: string,
  allowedOrigins: readonly string[],
): boolean {
  try {
    resolveVerificationOrigin(value, allowedOrigins, true)
    return false
  } catch {
    return true
  }
}

export default defineEval({
  description:
    'Preview verification brokers route auth and fails closed unless health, session creation, and streaming all succeed.',
  tags: ['routing', 'safety'],
  test(t) {
    t.check(brokeredCommand, includes(BROKERED_ROUTE_AUTH_HEADER))
    t.check(brokeredCommand, includes('VERIFICATION_OK:health-session-stream'))
    t.check(brokeredCommand, includes('VERIFICATION_FAILED:'))
    t.check(brokeredCommand, includes('exit 1'))
    t.check(
      brokeredCommand,
      satisfies(
        (command) =>
          typeof command === 'string' && !command.includes('--location'),
        'fails closed on redirects instead of forwarding broker placeholders',
      ),
    )
    t.check(
      curlCommandsDisableUserConfig,
      satisfies(
        (disabled) => disabled === true,
        'ignores sandbox curl config before every request',
      ),
    )
    t.check(
      healthCommand,
      satisfies(
        (command) =>
          typeof command === 'string' &&
          !command.includes(BROKERED_ROUTE_AUTH_HEADER),
        'does not send route auth to the public health endpoint',
      ),
    )
    t.check(
      [healthCommand, sessionCommand],
      satisfies(
        (commands) =>
          Array.isArray(commands) &&
          commands.every(
            (command) =>
              typeof command === 'string' &&
              command.includes('--connect-timeout 10') &&
              command.includes('--max-time 30'),
          ),
        'bounds health and session connection and request time',
      ),
    )
    t.check(
      [healthStatusPredicate, sessionStatusPredicate],
      satisfies(
        (predicates) =>
          Array.isArray(predicates) &&
          predicates.every(
            (predicate) =>
              typeof predicate === 'string' &&
              predicate.includes('_CURL_EXIT" -eq 0') &&
              !predicate.includes('_CURL_EXIT" -eq 28'),
          ),
        'treats health and session timeouts as verification failures',
      ),
    )
    t.check(
      resolveVerificationOrigin(
        'https://preview.example.com/eve/v1/health',
        ['https://preview.example.com'],
        true,
      ).origin,
      includes('https://preview.example.com'),
    )
    t.check(
      rejectsVerificationOrigin('https://attacker.example', [
        'https://preview.example.com',
      ]),
        satisfies(
          (rejected) => rejected === true,
          'rejects an off-allowlist host',
        ),
    )
    t.check(
      rejectsVerificationOrigin('http://preview.example.com', [
        'https://preview.example.com',
      ]),
      satisfies((rejected) => rejected === true, 'rejects non-HTTPS targets'),
    )
    t.check(
      brokeredCommand,
      satisfies(
        (command) =>
          typeof command === 'string' &&
          [
            'HEALTH_HTTP_STATUS',
            'SESSION_HTTP_STATUS',
            'STREAM_HTTP_STATUS',
          ].every((marker) => command.includes(marker)),
        'checks every HTTP status',
      ),
    )
    t.check(
      anonymousCommand,
      satisfies(
        (command) =>
          typeof command === 'string' &&
          !command.includes(BROKERED_ROUTE_AUTH_HEADER),
        'omits route auth when it is not configured',
      ),
    )
  },
})
