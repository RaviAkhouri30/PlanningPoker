# 02 · Design — First room

- Routes and components: [component tree](../../architecture/component-tree.md).
- Classes: [class diagram](../../architecture/class-diagram.md).
- Flows: [sequence diagrams](../../architecture/sequence-diagrams.md).
- Documents and rules: [data model](../../architecture/data-model.md).

## Voting logic (pure functions, unit-tested)

- Decks: Modified Fibonacci, Fibonacci, T-shirt (scored 1 2 3 5 8 13) and Powers of 2, each with
  `?` and `break`.
- Average and median of numeric votes; suggestion = nearest card to the average (ties go higher);
  agreement = share of numeric votes on the most common card; consensus at 100 % with > 1 vote.
- Outlier hint when the lowest and highest votes are ≥ 2 cards apart, otherwise an "unsure" hint.

## ADRs raised

ADR-0007 (anonymous guests) and ADR-0008 (secret votes).
