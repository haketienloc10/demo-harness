# Milk Tea Bill Splitter

## Product Contract

The app lets a user upload a milk tea bill image, preview the selected image,
extract bill data through a mock API, edit the extracted data, calculate each
person's share, and copy a readable payment summary.

The first implementation does not use a database, authentication, deployment,
bill history, external messaging integrations, bank transfer QR codes, mobile
native shells, or a real AI provider.

## Bill Data

```ts
type BillPerson = {
  name: string
  items: {
    name: string
    price: number
  }[]
}

type ExtractBillResult = {
  people: BillPerson[]
  shippingFee: number
  discountTotal: number
  warnings: string[]
}
```

## Extraction

`POST /api/extract-bill` accepts multipart form data containing one image file.
For the MVP, extraction returns deterministic mock bill data. AI integration is
kept behind `src/lib/ai/extract-bill.ts` so a later provider swap does not
require UI or route rewrites.

## Calculation Rules

Each person's total is calculated by `calculateSplit` only. Components must not
duplicate the business formula in JSX.

```text
itemTotal = sum(items.price)
shippingShare = shippingFee / people.length
discountShare = discountTotal / people.length
finalTotal = itemTotal + shippingShare - discountShare
```

The summary totals are:

```text
totalItems = sum(itemTotal)
expectedTotal = totalItems + shippingFee - discountTotal
totalCollected = sum(finalTotal)
difference = totalCollected - expectedTotal
```

## Validation Rules

The app validates editable bill data with Zod:

- `people` must contain at least one person.
- Person `name` must not be empty.
- Each person must contain at least one item.
- Item `name` must not be empty.
- Item `price` must be greater than or equal to `0`.
- `shippingFee` must be greater than or equal to `0`.
- `discountTotal` must be greater than or equal to `0`.

Invalid data is shown as warnings/errors in the UI. Copying the result is
disabled while data is invalid.
