import { z } from "zod";

export const billItemSchema = z.object({
  name: z.string().trim().min(1, "Tên món không được rỗng"),
  price: z.number().min(0, "Giá món phải >= 0"),
});

export const billPersonSchema = z.object({
  name: z.string().trim().min(1, "Tên người không được rỗng"),
  items: z.array(billItemSchema).min(1, "Mỗi người phải có ít nhất 1 món"),
});

export const extractBillResultSchema = z.object({
  people: z.array(billPersonSchema).min(1, "Bill phải có ít nhất 1 người"),
  shippingFee: z.number().min(0, "Ship phải >= 0"),
  discountTotal: z.number().min(0, "Giảm giá phải >= 0"),
  warnings: z.array(z.string()),
});

export type BillItem = z.infer<typeof billItemSchema>;
export type BillPerson = z.infer<typeof billPersonSchema>;
export type ExtractBillResult = z.infer<typeof extractBillResultSchema>;

export function validateBillData(input: ExtractBillResult) {
  return extractBillResultSchema.safeParse(input);
}
