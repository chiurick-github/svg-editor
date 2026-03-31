# Contributing to SVG Editor

## Development Workflow

```
Feature Branch → Unit Test → Push → CI Tests → PR → Code Review → Merge → Auto Release
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. **Never push directly.** |
| `feat/*` | New features (e.g., `feat/layer-panel`) |
| `fix/*` | Bug fixes (e.g., `fix/zoom-issue`) |
| `chore/*` | Maintenance (e.g., `chore/update-deps`) |

## Commit Convention (Conventional Commits)

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Version Bump |
|------|-------------|-------------|
| `feat` | New feature | Minor (0.x.0) |
| `fix` | Bug fix | Patch (0.0.x) |
| `docs` | Documentation only | None |
| `style` | Code style (no logic change) | None |
| `refactor` | Code refactor | None |
| `test` | Add/update tests | None |
| `chore` | Build, CI, tooling | None |
| `perf` | Performance improvement | Patch |
| `BREAKING CHANGE` | Breaking change | Major (x.0.0) |

### Examples

```bash
feat(canvas): add polygon drawing tool
fix(toolbar): correct active state highlight
test(store): add undo/redo edge case tests
docs: update README with build instructions
chore(ci): add macOS build step
```

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Coverage report
npm run test:coverage

# E2E tests (requires built app)
npm run build && npm run test:e2e

# Lint
npm run lint
```

## CI Pipeline

Every push triggers:
1. **Lint** → ESLint check
2. **Unit Tests** → Store logic
3. **Integration Tests** → Component rendering
4. **Coverage** → Must meet thresholds
5. **Build** → Electron build check

PRs to `main` also run E2E tests.

## Release Process

Releases are **fully automated**:
1. Merge PR to `main`
2. CI runs all tests
3. Version is auto-bumped based on commit types
4. CHANGELOG.md is auto-generated
5. macOS `.dmg` is built and uploaded to GitHub Releases

## Quality Requirements

| Metric | Threshold |
|--------|-----------|
| Statement Coverage | ≥ 80% |
| Branch Coverage | ≥ 55% |
| Function Coverage | ≥ 70% |
| Line Coverage | ≥ 80% |
| All Tests | Must pass |
| Lint | No errors |
