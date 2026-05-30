# Contributing

How to contribute to Agent Control. These conventions keep the repository
consistent and the history clean. Read CLAUDE.md and the two source documents
(ARCHITECTURE.md and SYSTEM_DESIGN.md) before making changes.

## Ground Rules

- Align all work with ARCHITECTURE.md and SYSTEM_DESIGN.md.
- Do not use em dashes anywhere. Use commas, periods, colons, semicolons, or parentheses.
- Never commit secrets. Use environment variables and the .env.example contract.
- Update affected documentation in the same change that changes behavior.

## Branch Naming

- Use short, descriptive, hyphenated branch names with a type prefix:
  - feat/short-description for features.
  - fix/short-description for bug fixes.
  - docs/short-description for documentation.
  - chore/short-description for tooling and maintenance.
  - test/short-description for test-only changes.
- Develop on your assigned branch. Do not push to a different branch without explicit permission.

## Commit Conventions

- Use Conventional Commits style: type(scope): summary.
  - Types: feat, fix, docs, chore, test, refactor, perf, build, ci.
  - Example: feat(deployments): enforce production quality gates.
- Write summaries in the imperative mood, present tense.
- Keep the subject under about 72 characters; add a body for context when needed.
- One logical change per commit where practical.
- No em dashes in commit messages.

## Pull Requests

- Open a pull request as ready for review (not a draft) once the branch is pushed.
- The PR description explains what changed, why, and how it was tested.
- Link the relevant phase from PHASES.md and any affected documents.
- Keep PRs focused; large changes should be split where reasonable.
- Ensure CI passes (lint, type check, unit, integration, contract tests, build, accessibility checks) before requesting review.
- Address review feedback with follow-up commits; do not force-push over a reviewer's in-progress review without coordination.

## Testing Expectations

- Add unit tests for business rules (gates, immutability, risk, fail-closed).
- Add integration tests for cross-module flows and persistence.
- Add contract tests when changing event envelopes or API shapes.
- Validate the demo flow end to end before marking a phase complete.
- Include accessibility checks for primary screens.
- See TESTING_STRATEGY.md for the full approach.

## Documentation Expectations

- Professional markdown at staff-engineer quality.
- No marketing fluff and no AI buzzword spam.
- Keep the documentation map in README.md accurate.
- Keep PHASES.md current as work progresses.
- When you add or change a behavior, update the relevant document (data model, events, API, governance, audit, observability, security) in the same change.

## Definition of Done

- Aligns with the two source documents.
- Tests appropriate to the layer are added and passing.
- Audit, tenancy, and fail-closed guarantees are preserved.
- Documentation is updated.
- No secrets and no em dashes.
- CI is green and the PR is ready for review.
