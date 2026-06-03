import { NextResponse } from "next/server";
import { extractBillFromImage } from "@/lib/ai/extract-bill";
import { extractBillResultSchema } from "@/lib/bill-schema";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Thiếu file ảnh trong form data" },
      { status: 400 },
    );
  }

  const extracted = await extractBillFromImage(file);
  const parsed = extractBillResultSchema.safeParse(extracted);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu bill không hợp lệ",
        details: parsed.error.flatten(),
      },
      { status: 500 },
    );
  }

  return NextResponse.json(parsed.data);
}
