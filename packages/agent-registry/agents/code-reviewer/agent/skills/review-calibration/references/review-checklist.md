# Review lenses
- Can a valid request now fail because of ordering, retries, or stale cache state?
- Does any new branch bypass authz, rate limiting, or ownership checks?
- Can the new code create partial writes or inconsistent state on failure?
- Does the patch need a migration, rollback, or a feature flag to be safe?
- What is the smallest test that would catch the highest-risk regression?
