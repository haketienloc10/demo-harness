import { describe, expect, it } from "vitest";
import { validateBillData } from "./bill-schema";

const validBill = {
  people: [
    {
      name: "Lộc",
      items: [{ name: "Trà sữa trân châu", price: 50000 }],
    },
  ],
  shippingFee: 15000,
  discountTotal: 20000,
  warnings: [],
};

describe("validateBillData", () => {
  it("accepts valid bill data", () => {
    expect(validateBillData(validBill).success).toBe(true);
  });

  it("rejects empty people", () => {
    expect(validateBillData({ ...validBill, people: [] }).success).toBe(false);
  });

  it("rejects negative money values", () => {
    expect(
      validateBillData({
        ...validBill,
        people: [
          {
            name: "Lộc",
            items: [{ name: "Trà sữa trân châu", price: -1 }],
          },
        ],
      }).success,
    ).toBe(false);
    expect(validateBillData({ ...validBill, shippingFee: -1 }).success).toBe(
      false,
    );
    expect(validateBillData({ ...validBill, discountTotal: -1 }).success).toBe(
      false,
    );
  });
});
