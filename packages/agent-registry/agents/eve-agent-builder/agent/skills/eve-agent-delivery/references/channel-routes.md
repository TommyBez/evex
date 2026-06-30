# Eve channel routes

Document these routes in README setup when adding channels:

- GitHub: `/eve/v1/github`
- Slack: `/eve/v1/slack`
- Eve session API: `/eve/v1/session`

Health check after deploy:

```bash
curl https://<deployment>/eve/v1/health
curl -X POST https://<deployment>/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Smoke test the new agent."}'
```

For preview protection, use `verify_vercel_preview` instead of raw curl. It
brokers `VERCEL_AUTOMATION_BYPASS_SECRET` as `x-vercel-protection-bypass`,
creates a smoke-test session, attaches to the stream, and clears the transform
before returning.
