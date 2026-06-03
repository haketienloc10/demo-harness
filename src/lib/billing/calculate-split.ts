import type { BillPerson } from "@/lib/bill-schema";

export type CalculateSplitInput = {
  people: BillPerson[];
  shippingFee: number;
  discountTotal: number;
};

export type SplitPersonResult = {
  name: string;
  itemTotal: number;
  shippingShare: number;
  discountShare: number;
  finalTotal: number;
};

export type SplitSummary = {
  people: SplitPersonResult[];
  totalItems: number;
  expectedTotal: number;
  totalCollected: number;
  difference: number;
};

export function calculateSplit(input: CalculateSplitInput): SplitSummary {
  const totalItems = input.people.reduce(
    (peopleTotal, person) =>
      peopleTotal +
      person.items.reduce((itemTotal, item) => itemTotal + item.price, 0),
    0,
  );

  if (input.people.length === 0) {
    const expectedTotal = totalItems + input.shippingFee - input.discountTotal;

    return {
      people: [],
      totalItems,
      expectedTotal,
      totalCollected: 0,
      difference: -expectedTotal,
    };
  }

  const shippingShare = input.shippingFee / input.people.length;
  const discountShare = input.discountTotal / input.people.length;
  const people = input.people.map((person) => {
    const itemTotal = person.items.reduce(
      (total, item) => total + item.price,
      0,
    );
    const finalTotal = itemTotal + shippingShare - discountShare;

    return {
      name: person.name,
      itemTotal,
      shippingShare,
      discountShare,
      finalTotal,
    };
  });
  const expectedTotal = totalItems + input.shippingFee - input.discountTotal;
  const totalCollected = people.reduce(
    (total, person) => total + person.finalTotal,
    0,
  );

  return {
    people,
    totalItems,
    expectedTotal,
    totalCollected,
    difference: totalCollected - expectedTotal,
  };
}
