# Review lenses
- Can a valid request now fail because of ordering, retries, or stale cache state?
- Does any new branch bypass authz, rate limiting, or ownership checks?
- Can the new code create partial writes or inconsistent state on failure?
- Does the patch need a migration, rollback, or a feature flag to be safe?
- What is the smallest test that would catch the highest-risk regression?
- Does a changed external side effect need idempotency, approval, or throttling?
- Does any user-controlled input reach file, network, shell, or markup surfaces?
- Can the finding be anchored to a changed diff line, or should it stay in the summary?
