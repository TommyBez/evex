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

`evex-new` is a pnpm/Turborepo monorepo. `apps/web` is the Next.js 16 App Router registry UI, and `apps/agents/<slug>` contains standalone Eve apps. Agents are code-owned and added by pull request; the database stores runtime state only, not canonical agent metadata or files. Runtime data still lives in Postgres via `drizzle-orm`/`pg`, and auth is handled by `better-auth` (email+password, plus optional GitHub OAuth).

### Running / lint / build (commands live in `package.json`)
- Dev server: `pnpm dev` (runs `@evex-new/web` through Turborepo on port 3000).
- Lint/format check: `pnpm run check` (ultracite/biome through Turborepo). Use `pnpm run fix` for auto-fixes.
- Agent catalog: update the root `registry.json` and the relevant `apps/agents/*/registry.json` when adding/changing an app; route handlers serve it through `loadRegistry` / `loadRegistryItem`.
- Build: `pnpm build` (builds the web app and the current Eve app packages).

### Database (required to run the app)
- `apps/web` reads `DATABASE_URL` for auth, profiles, favorites, and install metrics. Public agent metadata/files come from the source-owned shadcn registry files.
- There are **no Drizzle migrations or a `drizzle.config.ts`**. Tables are defined only in `apps/web/lib/db/schema.ts` and must be created manually on a fresh database. Required tables: `user`, `session`, `account`, `verification` (better-auth, camelCase column names — do not rename) plus `agent_install_metric`, `agent_favorite`, and `profile`.
- For local dev, set `BETTER_AUTH_URL=http://localhost:3000`, any `BETTER_AUTH_SECRET`, and `DATABASE_URL` in the environment used by `apps/web` (for example `apps/web/.env.local` or shell/Vercel project env).

### Non-obvious gotchas
- In `NODE_ENV=development`, better-auth issues cookies with `Secure; SameSite=None`. This still works on `http://localhost:3000` because browsers treat `localhost` as a secure context — sign-in/sign-up succeed locally.
- The log line `WARN [Better Auth]: Social provider github is missing clientId or clientSecret` is harmless unless you specifically need GitHub OAuth (set `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`). Email+password auth works without it.
- The `pg` "SSL modes ... treated as aliases for verify-full" warnings are benign.
- `pnpm install` reports ignored build scripts (`esbuild`, `msw`, `sharp`); the dev server runs fine without approving them.
