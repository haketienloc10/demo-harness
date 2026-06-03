# Demo Harness Project

Welcome to the `demo-harness` project. This project serves as a Next.js 15
application integrated with the Harness system—a repository operating system
designed to help AI Agents safely transform requirements into verifiable changes.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Schema Validation**: Zod
- **Testing**: Vitest, React Testing Library

## Project Structure

- `src/`: Contains the application code (`app` router and `lib`).
- `docs/`: Holds the Harness documentation, architectural decisions, and product
  specifications.
- `scripts/`: CLI utilities and database migrations for the Harness system.
- `_harness/`: Core instructions and rules for AI Agents.
- `harness.db`: SQLite database for tracking durable layers of the Harness
  system (intakes, stories, traces, decisions, etc.).

## The Harness System

This project heavily relies on the **Harness v0** philosophy. The core idea is
that no code or spec is added without a proper intake and planning process.

Agents and developers interact with `harness.db` using the `harness-cli`.
If you are an agent, make sure to read `_harness/00-AGENTS.md` and
`_harness/01-WORKFLOW.md` to understand the rules and lanes for any task.

## Running Locally

To install dependencies:

```bash
npm install
```

To run the development server:

```bash
npm run dev
```

To run tests:

```bash
npm test
```

To validate the build:

```bash
npm run validate:quick
```
