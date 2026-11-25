# ADR-0005: ESLint flat config, not TSLint

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

TSLint is deprecated. Most of the rules in CLAUDE.md are meant to be enforced by tools, not review.

## Decision

One ESLint 10 flat config with angular-eslint, typescript-eslint (strict, type-checked), sonarjs, security and prettier, run with `--max-warnings 0`. Limits: 300-line files, 30-line functions, complexity 10, no magic numbers, no style bindings in templates.

## Consequences

- Most review comments become lint errors.
- `security/detect-object-injection` flags dynamic indexing, so code uses `Map.get()`, `.at()` or helpers.
- `eslint-disable` needs a comment and the owner's approval.
