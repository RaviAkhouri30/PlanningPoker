# Versioning & Releases

- [Semantic Versioning](https://semver.org). `package.json` `version` is the single source of truth.
- 1.0.0 is the foundation; every feature bumps MINOR, fixes bump PATCH, breaking changes MAJOR.
- `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com).

## Release steps

1. `npm run verify`, `npm run e2e`, and for data changes `npm run test:rules` and `npm run e2e:firebase`.
2. Add the CHANGELOG entry under the new version.
3. `npm run release:minor` (or `:patch`, `:major`): bumps the version, commits and tags `vX.Y.Z`.
4. Record the release in the feature's `05-operations.md`.
5. Push only with the owner's OK; the workflow deploys `main`.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `test:`,
`refactor:`, `chore:`, with an optional scope (`feat(room): …`). `feat` maps to MINOR and `fix` to PATCH.
