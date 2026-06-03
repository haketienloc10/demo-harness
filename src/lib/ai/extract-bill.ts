import type { ExtractBillResult } from "@/lib/bill-schema";

export async function extractBillFromImage(
  file: File,
): Promise<ExtractBillResult> {
  void file;

  return {
    people: [
      {
        name: "Lộc",
        items: [
          {
            name: "Trà sữa trân châu",
            price: 50000,
          },
        ],
      },
      {
        name: "An",
        items: [
          {
            name: "Matcha latte",
            price: 60000,
          },
        ],
      },
    ],
    shippingFee: 15000,
    discountTotal: 20000,
    warnings: [],
  };
}
