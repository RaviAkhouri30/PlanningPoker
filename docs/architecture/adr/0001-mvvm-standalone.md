# ADR-0001: MVVM with standalone components

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

The owner's projects share one architecture so rules, reviews and tooling carry over. Angular 22 is standalone-first and zoneless.

## Decision

Use MVVM: a page and small presentational components render signals from a component-scoped `@Injectable()` view model; root `@Service()` services hold data access. `ViewModel<T>` and `BaseComponent<T>` live in `shared/base`; `BaseComponent` is the only place the view layer subscribes. No NgModules, OnPush everywhere.

## Consequences

- Components stay thin and easy to test; view models are tested without the DOM.
- The base class owns a private `state` signal, so view models expose their page state as `view`.
- Every page needs a view model even when it is small.
