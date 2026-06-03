# US-001 Milk Tea Bill Splitter MVP

## Status

implemented

## Lane

normal

## Product Contract

Build a one-screen Next.js App Router MVP that uploads and previews a bill
image, calls a mock extraction API, renders editable extracted bill data,
calculates per-person payment totals, validates edited data with Zod, and
copies a readable Vietnamese summary to the clipboard.

## Relevant Product Docs

- `docs/product/milk-tea-bill-splitter.md`
- `tmp/US-ta-tua.md`

## Acceptance Criteria

- User can select a `.jpg` or `.png` image and see a correct preview.
- Clicking `Đọc bill` posts the image to `POST /api/extract-bill`.
- The API returns the deterministic mock data from the user spec.
- The UI renders people, items, prices, shipping fee, discount, and warnings.
- User can edit person names, item names, item prices, shipping fee, and
  discount total.
- User can add/delete people and add/delete items.
- Split calculation lives in `src/lib/billing/calculate-split.ts`.
- The mock data calculates Lộc as `47.500đ` and An as `57.500đ`.
- Summary totals show total items `110.000đ`, ship `15.000đ`, discount
  `20.000đ`, total to collect `105.000đ`, total split `105.000đ`, and
  difference `0đ`.
- `Copy kết quả` copies the requested text format and shows `Đã copy`.
- Zod validation blocks copying when there are no people, empty names, empty
  item names, negative prices, negative shipping, or negative discount.
- Extraction is abstracted through `src/lib/ai/extract-bill.ts`.

## Design Notes

- Commands: editable bill changes are local React state updates.
- Queries: no durable query or database access.
- API: `POST /api/extract-bill` parses multipart form data and returns
  `ExtractBillResult`.
- Tables: none.
- Domain rules: `calculateSplit` owns per-person split math.
- UI surfaces: single home page with upload, preview, editable bill form,
  validation messages, calculated result, and copy action.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-001 --unit 1 --integration 1`
`--e2e 0 --platform 0`.

| Layer       | Expected proof                                      |
| ----------- | --------------------------------------------------- |
| Unit        | Vitest coverage for split calculation and validation |
| Integration | API route test or build/typecheck coverage          |
| E2E         | Not required for MVP unless tooling is added        |
| Platform    | Not required                                        |
| Release     | `npm run lint`, `npm test`, and `npm run build`     |

## Harness Delta

None expected.

## Evidence

- `npm run lint` passed.
- `npm test` passed with 2 test files and 4 tests.
- `npm run build` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
