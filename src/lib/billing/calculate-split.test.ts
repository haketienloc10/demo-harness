import { describe, expect, it } from "vitest";
import { calculateSplit } from "./calculate-split";

describe("calculateSplit", () => {
  it("splits shipping and discount evenly", () => {
    const result = calculateSplit({
      people: [
        {
          name: "Lộc",
          items: [{ name: "Trà sữa trân châu", price: 50000 }],
        },
        {
          name: "An",
          items: [{ name: "Matcha latte", price: 60000 }],
        },
      ],
      shippingFee: 15000,
      discountTotal: 20000,
    });

    expect(result.people).toEqual([
      {
        name: "Lộc",
        itemTotal: 50000,
        shippingShare: 7500,
        discountShare: 10000,
        finalTotal: 47500,
      },
      {
        name: "An",
        itemTotal: 60000,
        shippingShare: 7500,
        discountShare: 10000,
        finalTotal: 57500,
      },
    ]);
    expect(result.totalItems).toBe(110000);
    expect(result.expectedTotal).toBe(105000);
    expect(result.totalCollected).toBe(105000);
    expect(result.difference).toBe(0);
  });
});
