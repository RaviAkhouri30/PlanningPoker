# PlanningPoker — Documentation

The rules themselves live in [`../CLAUDE.md`](../CLAUDE.md). This folder explains them and records
how the system is built.

| Document                                                               | Purpose                                                  |
| ---------------------------------------------------------------------- | -------------------------------------------------------- |
| [architecture/overview.md](architecture/overview.md)                   | System context, layers, dependency rules                 |
| [architecture/class-diagram.md](architecture/class-diagram.md)         | Base classes, ports, adapters, the room feature          |
| [architecture/component-tree.md](architecture/component-tree.md)       | Routes and component hierarchy                           |
| [architecture/sequence-diagrams.md](architecture/sequence-diagrams.md) | Create, join, vote, flip, settle                         |
| [architecture/data-model.md](architecture/data-model.md)               | Firestore documents, who may read and write them         |
| [architecture/deployment.md](architecture/deployment.md)               | Environments, CI pipeline, hosting                       |
| [architecture/adr/](architecture/adr/)                                 | Architecture Decision Records                            |
| [tooling.md](tooling.md)                                               | Lint, tests, coverage, rules tests, e2e — how they are wired |
| [versioning.md](versioning.md)                                         | SemVer, release steps, changelog policy                  |
| [aidlc/](aidlc/README.md)                                              | AI-Driven Development Lifecycle records per feature      |

Diagrams are Mermaid. They render on GitHub and in VS Code with a Mermaid preview extension, and
`npm run check:diagrams` fails on a broken one.
