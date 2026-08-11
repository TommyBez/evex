# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.

---

## Cursor Cloud specific instructions

`evex` is a pnpm/Turborepo monorepo. `apps/web` is the Next.js 16 App Router registry UI, `packages/agent-registry` is the registry engine (Zod schema, generator, public API), and the code-owned agents live in the top-level `registry/<slug>` directory — a **separate pnpm workspace with its own lockfile** (`pnpm registry:install` to install it). Agents are added by pull request; the database stores runtime state only, not canonical agent metadata or files. Runtime data lives in Postgres via `drizzle-orm`/`pg`, and auth is handled by `better-auth` (passwordless email one-time codes, plus optional GitHub OAuth).

### Running / lint / test / build (commands live in `package.json`)
- Dev server: `pnpm dev` (runs `@evex/web` through Turborepo on port 3000; the registry build runs first via `dependsOn`).
- Lint/format check: `pnpm run check` (ultracite/biome through Turborepo; the agent-registry `check` also validates every `registry.json` against the Zod schema in `packages/agent-registry/src/schema.ts`). Use `pnpm run fix` for auto-fixes.
- Tests: `pnpm test` (Vitest — registry schema/generator/contract tests in `packages/agent-registry/tests`, pure-logic tests in `apps/web/tests`).
- Typecheck: `pnpm typecheck` (web app + packages) and `pnpm typecheck:agents` (every agent in the `registry/` workspace; run `pnpm registry:install` first).
- Agent catalog: agents live in `registry/<slug>` with a per-agent `registry.json`. The generator emits **gitignored JSON artifacts** to `packages/agent-registry/generated/` (catalog + one item file per agent + a lazy loader index, so each item is its own code-split chunk) plus the committed `.github/CODEOWNERS`; artifacts regenerate automatically on `pnpm install` (root postinstall) and `pnpm build`, or run `pnpm --filter @evex/agent-registry generate` after editing an agent. The web app serves the catalog at `/r/registry.json` (sync `getRegistry`) and items at `/r/{name}` (async `getRegistryItem`) from `@evex/agent-registry`. New agents: `pnpm --filter @evex/agent-registry registry:new <slug> <github-username>`; eve version bumps: `pnpm --filter @evex/agent-registry bump-eve <range>` (see CONTRIBUTIONS.md).
- Build: `pnpm build` (generates the registry, then builds `@evex/web`).
- CI (`.github/workflows/ci.yml`) runs check (incl. registry + CODEOWNERS freshness) + typecheck + agent typecheck + test + migrate + build against a Postgres service on every PR; `typecheck-agents.yml` additionally smoke-tests changed agents standalone (`pnpm install --ignore-workspace`).

### Install command
- The public, product-facing install command is `eve add <site-url>/r/{slug}.json`, built by `buildInstallCommand` in `apps/web/lib/site-url.ts` and shown on every agent page and the home hero. The site URL stays preview-aware so an unmerged agent installs from the deployment that serves it. Registry payloads remain shadcn-compatible internally, and the legacy `@evex` mapping in `apps/web/components.json` is retained for protocol compatibility, but shadcn commands are not public install copy.

### Database (required to run the app)
- `apps/web` reads `DATABASE_URL` for auth, profiles, favorites, and install metrics. Public agent metadata/files come from the source-owned shadcn registry files.
- The schema is defined in `apps/web/lib/db/schema.ts` with Drizzle migrations in `apps/web/drizzle` (config in `apps/web/drizzle.config.ts`). On a fresh database run `pnpm db:migrate` to create the tables (`pnpm db:push` syncs the schema directly for quick local setup, `pnpm db:generate` writes a new migration after schema edits, `pnpm db:studio` opens the inspector). Tables: `user`, `session`, `account`, `verification` (better-auth, camelCase column names — do not rename) plus `agent_install_metric`, `agent_favorite`, and `profile`.
- For local dev, copy `apps/web/.env.example` to `apps/web/.env.local` and fill in `DATABASE_URL` (plus `BETTER_AUTH_URL=http://localhost:3000` and any `BETTER_AUTH_SECRET`). Environment variables are validated at startup by the Zod schema in `apps/web/lib/env.ts` — a missing/invalid variable fails fast with a clear error. Delivering sign-in codes in production also needs `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

### Non-obvious gotchas
- Outside production (`NODE_ENV=development` or Vercel preview), OTP delivery is bypassed (`shouldBypassAuthOtp` in `apps/web/lib/auth-environment.ts`): no email is sent and Resend credentials are not required locally.
- GitHub OAuth is optional: the provider is only registered when both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set (setting only one fails env validation). Email one-time-code sign-in works without it.
- The `pg` "SSL modes ... treated as aliases for verify-full" warnings are benign.
- `pnpm install` reports ignored build scripts (`esbuild`, `msw`, `sharp`); the dev server runs fine without approving them.
