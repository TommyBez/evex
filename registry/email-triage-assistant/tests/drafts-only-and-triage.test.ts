import { describe, expect, it } from 'vitest'

import { replyClaimsDelivery } from '../agent/lib/delivery-claims'
import {
  DEFAULT_TRIAGE_CRON,
  isSlackNotifyConfigured,
  loadEmailTriageConfig,
  missingEmailProviderEnv,
  resolveEmailProvider,
} from '../agent/lib/email-config'
import {
  GMAIL_CONNECT_SCOPES,
  MICROSOFT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
} from '../agent/lib/oauth'
import { MAX_MULTIPART_NESTING, parseMimeMessage } from '../agent/lib/mime'
import { createGmailMailbox } from '../agent/lib/providers/gmail'
import {
  createGraphMailbox,
  escapeODataStringLiteral,
} from '../agent/lib/providers/graph'
import { createImapMailbox } from '../agent/lib/providers/imap'
import {
  extractRfc822Literal,
  ImapClient,
  type ImapTransport,
} from '../agent/lib/providers/imap-session'
import { authorizeInboxPush } from '../agent/lib/push-auth'
import { parsePushEvent } from '../agent/lib/push-events'
import { buildRfc822 } from '../agent/lib/rfc822'
import {
  assertDraftsOnlyHttp,
  assertDraftsOnlyImap,
  assertNotSendIntent,
  isForbiddenSendUrl,
  isForbiddenSmtpEndpoint,
} from '../agent/lib/send-guard'
import {
  buildSlackDraftsReadyText,
  notifySlackDraftsReady,
} from '../agent/lib/slack-notify'
import { buildToneProfile } from '../agent/lib/tone-profile'
import {
  DEFAULT_TRIAGE_BUCKETS,
  gmailLabelForBucket,
  imapFolderForBucket,
  isKnownTriageBucket,
  parseTriageBuckets,
} from '../agent/lib/triage-buckets'
import { webhookSecretsMatch } from '../agent/lib/webhook-auth'

function gmailConfig() {
  return loadEmailTriageConfig({
    EMAIL_PROVIDER: 'gmail',
    EMAIL_TRIAGE_GOOGLE_CONNECT_UID: 'google/email-triage-assistant',
    GMAIL_USER: 'me@example.com',
  })
}

const mintGmailToken: ConnectTokenMint = async () => ({
  accessToken: 'ya29.token',
  expiresIn: 3600,
})

const mintGraphToken: ConnectTokenMint = async () => ({
  accessToken: 'eyJ',
  expiresIn: 3600,
})

describe('send guard', () => {
  it('refuses Gmail send, Graph sendMail, and SMTP', () => {
    expect(
      isForbiddenSendUrl(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      ),
    ).toBe(true)
    expect(
      isForbiddenSendUrl(
        'https://gmail.googleapis.com/gmail/v1/users/me/drafts/send',
      ),
    ).toBe(true)
    expect(
      isForbiddenSendUrl('https://graph.microsoft.com/v1.0/me/sendMail'),
    ).toBe(true)
    expect(isForbiddenSmtpEndpoint('smtp.example.com', 587)).toBe(true)
    expect(isForbiddenSmtpEndpoint('imap.example.com', 993)).toBe(false)
    expect(() =>
      assertDraftsOnlyHttp(
        'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
        'POST',
      ),
    ).not.toThrow()
    expect(() =>
      assertDraftsOnlyHttp(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        'POST',
      ),
    ).toThrow(/never sends mail/)
    expect(() => assertDraftsOnlyImap('smtp.gmail.com', 465)).toThrow(/SMTP/)
    expect(() => assertNotSendIntent('send')).toThrow(/Drafts/)
    expect(() => assertNotSendIntent('draft')).not.toThrow()
  })
})

describe('triage buckets', () => {
  it('defaults and validates configured slugs', () => {
    expect(parseTriageBuckets(undefined)).toEqual([...DEFAULT_TRIAGE_BUCKETS])
    expect(parseTriageBuckets('Needs-Reply, FYI, needs-reply')).toEqual([
      'needs-reply',
      'fyi',
    ])
    expect(isKnownTriageBucket('needs-reply', DEFAULT_TRIAGE_BUCKETS)).toBe(
      true,
    )
    expect(isKnownTriageBucket('unknown', DEFAULT_TRIAGE_BUCKETS)).toBe(false)
    expect(gmailLabelForBucket('needs-reply')).toBe('triage/needs-reply')
    expect(imapFolderForBucket('fyi')).toBe('Triage/fyi')
  })
})

describe('schedule and provider config', () => {
  it('defaults the cron and resolves the first complete provider', () => {
    const empty = loadEmailTriageConfig({})
    expect(empty.cron).toBe(DEFAULT_TRIAGE_CRON)
    expect(empty.provider).toBeNull()
    expect(missingEmailProviderEnv(empty)).toEqual(['EMAIL_PROVIDER'])

    expect(
      resolveEmailProvider({
        EMAIL_TRIAGE_GOOGLE_CONNECT_UID: 'google/email-triage-assistant',
      }),
    ).toBe('gmail')
    expect(
      resolveEmailProvider({
        GMAIL_CLIENT_ID: 'id',
        GMAIL_CLIENT_SECRET: 'secret',
        GMAIL_REFRESH_TOKEN: 'refresh',
      }),
    ).toBeNull()
    expect(
      resolveEmailProvider({
        EMAIL_TRIAGE_GOOGLE_CONNECT_UID: 'google/email-triage-assistant',
        EMAIL_TRIAGE_MICROSOFT_CONNECT_UID: 'microsoft/email-triage-assistant',
      }),
    ).toBe('gmail')
    expect(
      resolveEmailProvider({
        EMAIL_TRIAGE_MICROSOFT_CONNECT_UID: 'microsoft/email-triage-assistant',
      }),
    ).toBe('outlook')
    expect(
      resolveEmailProvider({
        EMAIL_PROVIDER: 'outlok',
        EMAIL_TRIAGE_GOOGLE_CONNECT_UID: 'google/email-triage-assistant',
      }),
    ).toBeNull()
    expect(
      resolveEmailProvider({
        EMAIL_PROVIDER: 'imap',
        IMAP_HOST: 'imap.example.com',
        IMAP_USER: 'me',
        IMAP_PASSWORD: 'pw',
      }),
    ).toBe('imap')
    expect(
      missingEmailProviderEnv(
        loadEmailTriageConfig({ EMAIL_PROVIDER: 'gmail' }),
      ),
    ).toEqual(['EMAIL_TRIAGE_GOOGLE_CONNECT_UID'])
  })

  it('mints a Connect access token through the injected helper', async () => {
    const token = await mintConnectAccessToken({
      connectorUid: 'google/email-triage-assistant',
      scopes: GMAIL_CONNECT_SCOPES,
      mintImpl: async (input) => {
        expect(input.connectorUid).toBe('google/email-triage-assistant')
        expect(input.scopes).toEqual([...GMAIL_CONNECT_SCOPES])
        return { accessToken: 'ya29.token', expiresIn: 3600 }
      },
    })
    expect(token).toEqual({ accessToken: 'ya29.token', expiresIn: 3600 })
  })
})

describe('Gmail drafts.create never hits send', () => {
  it('mints a Connect token once, lists inbox, and POSTs /drafts only', async () => {
    const urls: string[] = []
    let mintCount = 0
    let mintedUid = ''
    let mintedScopes: readonly string[] = []
    let draftRaw = ''
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input)
      urls.push(`${init?.method ?? 'GET'} ${url}`)
      if (url.includes('oauth2.googleapis.com/token')) {
        throw new Error('refresh-token OAuth must not run')
      }
      if (url.includes('/threads?') && url.includes('inbox')) {
        return Response.json({ threads: [{ id: 't1' }, { id: 't-done' }] })
      }
      if (url.includes('/threads/t-done')) {
        return Response.json({
          id: 't-done',
          snippet: 'Already triaged',
          messages: [
            {
              id: 'm-done',
              labelIds: ['INBOX', 'triage/needs-reply'],
              payload: {
                headers: [{ name: 'Subject', value: 'Done' }],
              },
            },
          ],
        })
      }
      if (url.includes('/threads/t1')) {
        return Response.json({
          id: 't1',
          snippet: 'Can we get a refund?',
          messages: [
            {
              id: 'm1',
              snippet: 'Can we get a refund?',
              labelIds: ['INBOX'],
              payload: {
                headers: [
                  { name: 'Subject', value: 'Refund' },
                  { name: 'From', value: 'ava@example.com' },
                ],
              },
            },
          ],
        })
      }
      if (url.endsWith('/drafts')) {
        const payload = JSON.parse(String(init?.body ?? '{}')) as {
          message?: { raw?: string }
        }
        draftRaw = payload.message?.raw ?? ''
        return Response.json({ id: 'd1' })
      }
      throw new Error(`unexpected ${url}`)
    }

    const mailbox = createGmailMailbox(gmailConfig(), fetchImpl, async (input) => {
      mintCount += 1
      mintedUid = input.connectorUid
      mintedScopes = input.scopes
      return mintGmailToken(input)
    })
    const threads = await mailbox.listThreads({ max: 5 })
    expect(threads.map((thread) => thread.id)).toEqual(['t1'])
    const draft = await mailbox.createDraftReply({
      threadId: 't1',
      to: 'ava@example.com',
      subject: 'Re: Refund',
      body: 'Hi Ava — I will check the annual-plan refund window and follow up.',
    })
    expect(draft.sent).toBe(false)
    expect(draft.mailbox).toBe('Drafts')
    const mime = decodeBase64Url(draftRaw)
    expect(mime).toContain('To: ava@example.com')
    expect(mime).toContain('Subject: Re: Refund')
    expect(mime).toContain(
      'Hi Ava — I will check the annual-plan refund window and follow up.',
    )
    expect(mintCount).toBe(1)
    expect(mintedUid).toBe('google/email-triage-assistant')
    expect(mintedScopes).toEqual([...GMAIL_CONNECT_SCOPES])
    expect(urls.some((url) => url.includes('oauth2.googleapis.com/token'))).toBe(
      false,
    )
    expect(urls.some((url) => url.includes('/messages/send'))).toBe(false)
    expect(urls.some((url) => url.includes('/drafts/send'))).toBe(false)
    expect(
      urls.some((url) => url.includes('POST ') && url.endsWith('/drafts')),
    ).toBe(true)
  })
})

describe('Graph createReply never sendMail', () => {
  it('creates a draft reply and patches it', async () => {
    const urls: string[] = []
    let patchBody: {
      subject?: string
      body?: { content?: string }
    } = {}
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input)
      urls.push(`${init?.method ?? 'GET'} ${url}`)
      if (url.includes('/oauth2/v2.0/token')) {
        throw new Error('refresh-token OAuth must not run')
      }
      if (url.includes('/mailFolders/drafts')) {
        return Response.json({ value: [{ conversationId: 'already-drafted' }] })
      }
      if (url.includes('/messages?') || url.includes('/mailFolders/inbox')) {
        return Response.json({
          value: [
            {
              id: 'm1',
              conversationId: 'c1',
              subject: 'Refund',
              bodyPreview: 'Can we get a refund?',
              from: { emailAddress: { address: 'ava@example.com' } },
            },
            {
              id: 'm2',
              conversationId: 'already-drafted',
              subject: 'Old',
              bodyPreview: 'Already drafted',
              from: { emailAddress: { address: 'sam@example.com' } },
            },
          ],
        })
      }
      if (url.includes('/createReply')) {
        return Response.json({ id: 'draft-1' })
      }
      if (url.includes('/messages/draft-1')) {
        patchBody = JSON.parse(String(init?.body ?? '{}')) as typeof patchBody
        return Response.json({ id: 'draft-1' })
      }
      throw new Error(`unexpected ${url}`)
    }

    let mintCount = 0
    let mintedScopes: readonly string[] = []
    const mailbox = createGraphMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: 'outlook',
        EMAIL_TRIAGE_MICROSOFT_CONNECT_UID: 'microsoft/email-triage-assistant',
      }),
      fetchImpl,
      async (input) => {
        mintCount += 1
        mintedScopes = input.scopes
        return mintGraphToken(input)
      },
    )
    const threads = await mailbox.listThreads({ max: 5 })
    expect(threads.map((thread) => thread.id)).toEqual(['c1'])
    const draft = await mailbox.createDraftReply({
      threadId: 'c1',
      to: 'ava@example.com',
      subject: 'Re: Refund',
      body: 'Hi Ava — I will check the annual-plan refund window and follow up.',
    })
    expect(draft.sent).toBe(false)
    expect(patchBody.subject).toBe('Re: Refund')
    expect(patchBody.body?.content).toContain(
      'Hi Ava — I will check the annual-plan refund window and follow up.',
    )
    expect(mintCount).toBe(1)
    expect(mintedScopes).toEqual([...MICROSOFT_CONNECT_SCOPES])
    expect(urls.some((url) => url.includes('/oauth2/v2.0/token'))).toBe(false)
    expect(urls.some((url) => url.toLowerCase().includes('sendmail'))).toBe(
      false,
    )
    expect(urls.some((url) => url.includes('/createReply'))).toBe(true)
    await mailbox.readThread("O'Bryan")
    expect(urls.some((url) => url.includes("O''Bryan"))).toBe(true)
  })

  it('follows Drafts @odata.nextLink before skipping already-drafted threads', async () => {
    const urls: string[] = []
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input)
      urls.push(url)
      if (url.includes('/mailFolders/inbox')) {
        return Response.json({
          value: [
            {
              id: 'm1',
              conversationId: 'c1',
              subject: 'Refund',
              bodyPreview: 'Can we get a refund?',
              from: { emailAddress: { address: 'ava@example.com' } },
            },
            {
              id: 'm2',
              conversationId: 'already-drafted',
              subject: 'Old',
              bodyPreview: 'Already drafted',
              from: { emailAddress: { address: 'sam@example.com' } },
            },
          ],
        })
      }
      if (
        url.includes('/mailFolders/drafts/messages') &&
        url.includes('$skiptoken=page2')
      ) {
        return Response.json({
          value: [{ conversationId: 'already-drafted' }],
        })
      }
      if (url.includes('/mailFolders/drafts/messages')) {
        return Response.json({
          value: [{ conversationId: 'other-draft' }],
          '@odata.nextLink':
            'https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages?$top=5&$select=conversationId&$skiptoken=page2',
        })
      }
      throw new Error(`unexpected ${url}`)
    }

    const mailbox = createGraphMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: 'outlook',
        EMAIL_TRIAGE_MICROSOFT_CONNECT_UID: 'microsoft/email-triage-assistant',
      }),
      fetchImpl,
      mintGraphToken,
    )
    const threads = await mailbox.listThreads({ max: 5 })
    expect(threads.map((thread) => thread.id)).toEqual(['c1'])
    expect(
      urls.filter((url) => url.includes('/mailFolders/drafts/messages')),
    ).toHaveLength(2)
    expect(urls.some((url) => url.includes('$skiptoken=page2'))).toBe(true)
  })
})

describe('IMAP APPEND to Drafts', () => {
  it('appends a Drafts literal and never talks SMTP', async () => {
    const writes: string[] = []
    const script = [
      '* OK IMAP ready\r\n',
      'A1 OK LOGIN\r\n',
      'A2 OK SELECT\r\n',
      '+ ready\r\n',
      'A3 OK [APPENDUID 1 99] APPEND\r\n',
      '* BYE\r\nA4 OK LOGOUT\r\n',
    ]
    let cursor = 0
    let pending = ''

    const transport: ImapTransport = {
      async write(chunk) {
        writes.push(chunk)
        if (chunk.startsWith('A3 APPEND')) {
          pending += script[cursor] ?? ''
          cursor += 1
        }
      },
      async readUntil(predicate) {
        if (!pending) {
          pending = script[cursor] ?? ''
          cursor += 1
        }
        const pendingBytes = Buffer.from(pending, 'utf8')
        if (!predicate(pendingBytes)) {
          throw new Error(`IMAP fixture did not satisfy read: ${pending}`)
        }
        pending = ''
        return pendingBytes
      },
      async close() {},
    }

    const mailbox = createImapMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: 'imap',
        IMAP_HOST: 'imap.example.com',
        IMAP_PORT: '993',
        IMAP_USER: 'me',
        IMAP_PASSWORD: 'pw',
        IMAP_DRAFTS_MAILBOX: 'Drafts',
      }),
      async () => transport,
    )

    const draft = await mailbox.createDraftReply({
      threadId: '12',
      to: 'ava@example.com',
      subject: 'Re: Refund',
      body: 'Hi Ava — I will check the annual-plan refund window and follow up.',
    })
    expect(draft.sent).toBe(false)
    expect(draft.mailbox).toBe('Drafts')
    const rfc822 = writes.find((chunk) => chunk.includes('Subject: Re: Refund'))
    expect(rfc822).toContain('To: ava@example.com')
    expect(rfc822).toContain(
      'Hi Ava — I will check the annual-plan refund window and follow up.',
    )
    expect(writes.some((chunk) => chunk.includes('APPEND "Drafts"'))).toBe(true)
    expect(writes.some((chunk) => /SMTP|MAIL FROM/i.test(chunk))).toBe(false)
  })

  it('creates triage folders before COPY', async () => {
    const writes: string[] = []
    const script = [
      '* OK IMAP ready\r\n',
      'A1 OK LOGIN\r\n',
      'A2 OK SELECT\r\n',
      'A3 OK CREATE\r\n',
      'A4 OK CREATE\r\n',
      'A5 OK COPY\r\n',
      'A6 OK STORE\r\n',
      '* BYE\r\nA7 OK LOGOUT\r\n',
    ]
    let cursor = 0
    const transport: ImapTransport = {
      async write(chunk) {
        writes.push(chunk)
      },
      async readUntil() {
        const snapshot = script[cursor] ?? ''
        cursor += 1
        return Buffer.from(snapshot, 'utf8')
      },
      async close() {},
    }

    const mailbox = createImapMailbox(
      loadEmailTriageConfig({
        EMAIL_PROVIDER: 'imap',
        IMAP_HOST: 'imap.example.com',
        IMAP_PORT: '993',
        IMAP_USER: 'me',
        IMAP_PASSWORD: 'pw',
      }),
      async () => transport,
    )

    const result = await mailbox.applyBucket('12', 'needs-reply')
    expect(result.sent).toBe(false)
    expect(writes.some((chunk) => chunk.includes('CREATE "Triage"'))).toBe(true)
    expect(
      writes.some((chunk) => chunk.includes('CREATE "Triage/needs-reply"')),
    ).toBe(true)
    expect(writes.some((chunk) => chunk.includes('UID COPY 12'))).toBe(true)
  })

  it('parses UID SEARCH from a scripted session', async () => {
    const script = [
      '* OK IMAP ready\r\n',
      'A1 OK LOGIN\r\n',
      '* SEARCH 10 11 12\r\nA2 OK SEARCH\r\n',
    ]
    let cursor = 0
    const transport: ImapTransport = {
      async write() {},
      async readUntil() {
        const snapshot = script[cursor] ?? ''
        cursor += 1
        return Buffer.from(snapshot, 'utf8')
      },
      async close() {},
    }
    const client = new ImapClient(transport)
    await client.connectGreeting()
    await client.login('me', 'pw')
    expect(await client.searchAll()).toEqual([10, 11, 12])
  })
})

describe('tone profile', () => {
  it('extracts greeting and sign-off from sent mail', () => {
    const profile = buildToneProfile([
      {
        subject: 'Re: Refund',
        body: 'Hi Ava,\n\nI can confirm the 14-day window.\n\nThanks,\nSam',
      },
      {
        subject: 'Re: Access',
        body: 'Hi team,\n\nWe reset the key this morning.\n\nThanks,\nSam',
      },
    ])
    expect(profile.sampleCount).toBe(2)
    expect(profile.greeting?.toLowerCase()).toContain('hi')
    expect(profile.signOff?.toLowerCase()).toContain('thanks')
    expect(profile.brief).toContain('Match the sent-folder voice')
  })
})

describe('push and Slack', () => {
  it('parses Gmail, Graph, and generic push payloads', () => {
    expect(
      parsePushEvent({
        searchParams: new URLSearchParams('validationToken=abc'),
      }),
    ).toEqual({ validationToken: 'abc' })
    expect(
      parsePushEvent({
        body: { message: { data: 'e30=' }, subscription: 'projects/x' },
      }),
    ).toMatchObject({ source: 'gmail', reason: 'push' })
    expect(parsePushEvent({ body: { subscriptionId: 'sub-1' } })).toMatchObject(
      { source: 'outlook', reason: 'push' },
    )
    expect(parsePushEvent({ body: { value: null } })).toEqual({
      ignored: true,
    })
    expect(parsePushEvent({ body: { reason: 'push' } })).toMatchObject({
      source: 'generic',
      reason: 'push',
    })
  })

  it('treats Slack as unset unless Connect UID and channel id are both set', () => {
    expect(isSlackNotifyConfigured(loadEmailTriageConfig({}))).toBe(false)
    expect(
      isSlackNotifyConfigured(
        loadEmailTriageConfig({
          EMAIL_TRIAGE_SLACK_CONNECT_UID: 'slack/email-triage-assistant',
        }),
      ),
    ).toBe(false)
    expect(
      isSlackNotifyConfigured(
        loadEmailTriageConfig({
          EMAIL_TRIAGE_SLACK_CHANNEL_ID: 'C0123456789',
        }),
      ),
    ).toBe(false)
    expect(
      isSlackNotifyConfigured(
        loadEmailTriageConfig({
          EMAIL_TRIAGE_SLACK_CONNECT_UID: 'slack/email-triage-assistant',
          EMAIL_TRIAGE_SLACK_CHANNEL_ID: 'C0123456789',
        }),
      ),
    ).toBe(true)
  })

  it('posts a drafts-ready Slack note without claiming email send', async () => {
    let posted:
      | {
          connectUid: string
          channelId: string
          text: string
        }
      | undefined
    const result = await notifySlackDraftsReady({
      connectUid: 'slack/email-triage-assistant',
      channelId: 'C0123456789',
      draftCount: 2,
      buckets: ['needs-reply'],
      sendImpl: async (input) => {
        posted = input
        return { ok: true }
      },
    })
    expect(result).toEqual({ notified: true, sent: false })
    expect(posted).toEqual({
      connectUid: 'slack/email-triage-assistant',
      channelId: 'C0123456789',
      text: buildSlackDraftsReadyText(2, ['needs-reply']),
    })
    expect(posted?.text).toContain('2 inbox drafts ready in Drafts.')
    expect(posted?.text).toContain('Buckets: needs-reply.')
    expect(posted?.text).toContain('Nothing was sent.')
    expect(posted?.text).not.toContain('hooks.slack.com')
  })

  it('returns a failure result when Slack channel send is not ok', async () => {
    const result = await notifySlackDraftsReady({
      connectUid: 'slack/email-triage-assistant',
      channelId: 'C0123456789',
      draftCount: 1,
      buckets: [],
      sendImpl: async () => ({ ok: false, error: 'channel_not_found' }),
    })
    expect(result).toEqual({
      notified: false,
      sent: false,
      note: 'channel_not_found',
    })
  })

  it('returns a failure result when Slack channel send rejects', async () => {
    const result = await notifySlackDraftsReady({
      connectUid: 'slack/email-triage-assistant',
      channelId: 'C0123456789',
      draftCount: 1,
      buckets: [],
      sendImpl: async () => {
        throw new Error('network down')
      },
    })
    expect(result).toEqual({
      notified: false,
      sent: false,
      note: 'Slack channel send failed: network down',
    })
  })

  it('rejects a mismatched push secret', () => {
    expect(webhookSecretsMatch('nope', 'secret')).toBe(false)
    expect(webhookSecretsMatch('secret', 'secret')).toBe(true)
    expect(webhookSecretsMatch(null, 'secret')).toBe(false)
  })
})

describe('replyClaimsDelivery', () => {
  it('treats send claims as delivery and ignores negated drafts', () => {
    expect(replyClaimsDelivery('Done — I sent the email.')).toBe(true)
    expect(
      replyClaimsDelivery('I drafted the reply and did not send it.'),
    ).toBe(false)
    expect(
      replyClaimsDelivery(
        'I did not send a reply today, but I sent it yesterday',
      ),
    ).toBe(true)
  })
})

describe('rfc822 header injection', () => {
  it('rejects CR and LF in every header value', () => {
    expect(() =>
      buildRfc822({
        to: 'victim@example.com\r\nBcc: attacker@example.com',
        subject: 'Re: Refund',
        body: 'Hello there, this draft stays in Drafts.',
      }),
    ).toThrow(/CR and LF/)
    expect(() =>
      buildRfc822({
        to: 'ava@example.com',
        subject: 'Re: Refund\nBcc: attacker@example.com',
        body: 'Hello there, this draft stays in Drafts.',
        inReplyTo: '<id@example.com>',
      }),
    ).toThrow(/CR and LF/)
  })
})

describe('MIME decode', () => {
  it('decodes multipart and quoted-printable bodies', () => {
    const parsed = parseMimeMessage(
      [
        'Subject: =?UTF-8?Q?Refund_window?=',
        'From: ava@example.com',
        'To: support@example.com',
        'Date: Tue, 8 Sep 2026 12:00:00 +0000',
        'Message-ID: <m1@example.com>',
        'Content-Type: multipart/alternative; boundary="b1"',
        '',
        '--b1',
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        'Can we get a refund=3F',
        '--b1',
        'Content-Type: text/html; charset=utf-8',
        '',
        '<p>HTML</p>',
        '--b1--',
      ].join('\r\n'),
    )
    expect(parsed.subject).toBe('Refund window')
    expect(parsed.body).toContain('Can we get a refund?')
    expect(parsed.body).not.toContain('HTML')
  })

  it('decodes declared MIME charset instead of assuming UTF-8', () => {
    const latin1 = parseMimeMessage(
      [
        'Subject: cafe',
        'From: ava@example.com',
        'To: support@example.com',
        'Content-Type: text/plain; charset=iso-8859-1',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        'caf=E9',
      ].join('\r\n'),
    )
    expect(latin1.body).toBe('café')

    const raw = Buffer.concat([
      Buffer.from(
        'Subject: cafe\r\nFrom: ava@example.com\r\nTo: support@example.com\r\nContent-Type: text/plain; charset=iso-8859-1\r\n\r\n',
        'ascii',
      ),
      Buffer.from([0x63, 0x61, 0x66, 0xe9]),
    ])
    expect(parseMimeMessage(raw).body).toBe('café')
  })

  it('stops nested multipart decode at the depth cap', () => {
    const inner = [
      'Content-Type: text/plain; charset=utf-8',
      '',
      'plain innermost',
    ].join('\r\n')
    const nest = (body: string, levels: number): string => {
      let current = body
      for (let level = 1; level <= levels; level += 1) {
        const boundary = `b${level}`
        current = [
          `Content-Type: multipart/mixed; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          current,
          `--${boundary}--`,
        ].join('\r\n')
      }
      return current
    }
    const overLimit = nest(inner, MAX_MULTIPART_NESTING + 1)
    const parsed = parseMimeMessage(`Subject: nest\r\nFrom: a@b.c\r\nTo: c@d.e\r\n${overLimit}`)
    expect(parsed.body).toBe('')
  })
})

const GMAIL_OIDC = {
  audience: 'https://example.com/inbox/push',
  serviceAccountEmail: 'pubsub@gcp-sa-pubsub.iam.gserviceaccount.com',
} as const

function gmailOidcRequest() {
  return new Request('https://example.com/inbox/push', {
    method: 'POST',
    headers: { authorization: 'Bearer aaa.bbb.ccc' },
    body: JSON.stringify({ message: { data: 'e30=' } }),
  })
}

function gmailOidcPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    iss: 'accounts.google.com',
    aud: GMAIL_OIDC.audience,
    email: GMAIL_OIDC.serviceAccountEmail,
    email_verified: 'true',
    exp: Math.floor(Date.now() / 1000) + 300,
    ...overrides,
  }
}

describe('push auth and OData', () => {
  it('accepts Gmail OIDC and Graph clientState', async () => {
    const gmail = await authorizeInboxPush({
      request: gmailOidcRequest(),
      body: { message: { data: 'e30=' } },
      expectedSecret: 'secret',
      gmailOidc: GMAIL_OIDC,
      fetchImpl: async () => Response.json(gmailOidcPayload()),
    })
    expect(gmail).toEqual({ authorized: true, method: 'gmail-oidc' })

    const graph = await authorizeInboxPush({
      request: new Request('https://example.com/inbox/push', {
        method: 'POST',
        body: JSON.stringify({
          value: [{ subscriptionId: 'sub-1', clientState: 'secret' }],
        }),
      }),
      body: { value: [{ subscriptionId: 'sub-1', clientState: 'secret' }] },
      expectedSecret: 'secret',
    })
    expect(graph).toEqual({ authorized: true, method: 'graph-client-state' })

    const denied = await authorizeInboxPush({
      request: new Request('https://example.com/inbox/push', {
        method: 'POST',
        body: JSON.stringify({ reason: 'push' }),
      }),
      body: { reason: 'push' },
      expectedSecret: 'secret',
    })
    expect(denied).toEqual({ authorized: false })
  })

  it('rejects malformed OIDC exp and unbound Gmail tokens', async () => {
    const deny = async (payload: Record<string, unknown>) => {
      const result = await authorizeInboxPush({
        request: gmailOidcRequest(),
        body: { message: { data: 'e30=' } },
        expectedSecret: 'secret',
        gmailOidc: GMAIL_OIDC,
        fetchImpl: async () => Response.json(payload),
      })
      expect(result).toEqual({ authorized: false })
    }

    await deny(gmailOidcPayload({ exp: [Math.floor(Date.now() / 1000) + 300] }))
    await deny(gmailOidcPayload({ exp: { seconds: 9999999999 } }))
    await deny(gmailOidcPayload({ aud: 'https://evil.example/inbox/push' }))
    await deny(
      gmailOidcPayload({ email: 'attacker@evil.iam.gserviceaccount.com' }),
    )
    await deny(gmailOidcPayload({ email_verified: false }))

    const missingBind = await authorizeInboxPush({
      request: gmailOidcRequest(),
      body: { message: { data: 'e30=' } },
      expectedSecret: 'secret',
      fetchImpl: async () => Response.json(gmailOidcPayload()),
    })
    expect(missingBind).toEqual({ authorized: false })
  })

  it('escapes OData apostrophes', () => {
    expect(escapeODataStringLiteral("O'Bryan")).toBe("O''Bryan")
  })
})

describe('IMAP session helpers', () => {
  it('uses the declared literal length and hides LOGIN passwords', async () => {
    const body = 'From: a@example.com\r\n\r\nLine with )\r\nA9 OK not a tag\r\n'
    const wrapped = `* 1 FETCH (FLAGS (\\Seen) RFC822 {${Buffer.byteLength(body, 'utf8')}}\r\n${body})\r\nA3 OK FETCH\r\n`
    expect(extractRfc822Literal(wrapped).toString('utf8')).toBe(body)

    const latin1Body = Buffer.concat([
      Buffer.from(
        'From: a@example.com\r\nContent-Type: text/plain; charset=iso-8859-1\r\n\r\n',
        'ascii',
      ),
      Buffer.from([0x63, 0x61, 0x66, 0xe9]),
    ])
    const latin1Wrapped = Buffer.concat([
      Buffer.from(`* 1 FETCH (RFC822 {${latin1Body.length}}\r\n`, 'ascii'),
      latin1Body,
      Buffer.from(')\r\nA3 OK FETCH\r\n', 'ascii'),
    ])
    const extracted = extractRfc822Literal(latin1Wrapped)
    expect(extracted.equals(latin1Body)).toBe(true)
    expect(parseMimeMessage(extracted).body).toBe('café')

    const writes: string[] = []
    const transport: ImapTransport = {
      async write(chunk) {
        writes.push(chunk)
      },
      async readUntil() {
        return Buffer.from('A1 NO LOGIN failed\r\n', 'utf8')
      },
      async close() {},
    }
    const client = new ImapClient(transport)
    await expect(client.login('me', 'super-secret')).rejects.toThrow(
      'IMAP login failed',
    )
    expect(writes[0]).toContain('super-secret')
    try {
      await client.login('me', 'super-secret')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('IMAP login failed')
      expect((error as Error).message).not.toContain('super-secret')
    }
  })

  it('treats CREATE ALREADYEXISTS as success and throws on other NO', async () => {
    const alreadyExists: string[] = [
      '* OK IMAP ready\r\n',
      'A1 NO [ALREADYEXISTS] Mailbox exists\r\n',
    ]
    let existsCursor = 0
    const existsClient = new ImapClient({
      async write() {},
      async readUntil() {
        const snapshot = alreadyExists[existsCursor] ?? ''
        existsCursor += 1
        return Buffer.from(snapshot, 'utf8')
      },
      async close() {},
    })
    await existsClient.connectGreeting()
    await existsClient.ensureMailbox('Triage')

    const denied: string[] = [
      '* OK IMAP ready\r\n',
      'A1 NO [NOPERM] Permission denied\r\n',
    ]
    let deniedCursor = 0
    const deniedClient = new ImapClient({
      async write() {},
      async readUntil() {
        const snapshot = denied[deniedCursor] ?? ''
        deniedCursor += 1
        return Buffer.from(snapshot, 'utf8')
      },
      async close() {},
    })
    await deniedClient.connectGreeting()
    await expect(deniedClient.ensureMailbox('Triage')).rejects.toThrow(
      'IMAP CREATE Triage failed.',
    )
  })
})

function decodeBase64Url(value: string): string {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  return Buffer.from(padded, 'base64').toString('utf8')
}
