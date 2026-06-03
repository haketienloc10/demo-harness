"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExtractBillResult } from "@/lib/bill-schema";
import { validateBillData } from "@/lib/bill-schema";
import { calculateSplit } from "@/lib/billing/calculate-split";

const emptyBill: ExtractBillResult = {
  people: [],
  shippingFee: 0,
  discountTotal: 0,
  warnings: [],
};

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

function formatVnd(value: number) {
  return `${moneyFormatter.format(Math.round(value))}đ`;
}

function issueMessages(bill: ExtractBillResult) {
  const parsed = validateBillData(bill);

  if (parsed.success) {
    return [];
  }

  return parsed.error.issues.map((issue) => issue.message);
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bill, setBill] = useState<ExtractBillResult>(emptyBill);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const validationIssues = useMemo(() => issueMessages(bill), [bill]);
  const isValid = validationIssues.length === 0;
  const split = useMemo(
    () =>
      calculateSplit({
        people: bill.people,
        shippingFee: bill.shippingFee,
        discountTotal: bill.discountTotal,
      }),
    [bill],
  );
  const sharedShipping = split.people[0]?.shippingShare ?? 0;
  const sharedDiscount = split.people[0]?.discountShare ?? 0;

  async function extractBill() {
    if (!selectedFile) {
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setCopyState("idle");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/extract-bill", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không đọc được bill. Vui lòng thử lại.");
      }

      const data = (await response.json()) as ExtractBillResult;
      setBill(data);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Có lỗi khi đọc bill.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updatePersonName(personIndex: number, name: string) {
    setBill((current) => ({
      ...current,
      people: current.people.map((person, index) =>
        index === personIndex ? { ...person, name } : person,
      ),
    }));
    setCopyState("idle");
  }

  function updateItem(
    personIndex: number,
    itemIndex: number,
    field: "name" | "price",
    value: string,
  ) {
    setBill((current) => ({
      ...current,
      people: current.people.map((person, currentPersonIndex) => {
        if (currentPersonIndex !== personIndex) {
          return person;
        }

        return {
          ...person,
          items: person.items.map((item, currentItemIndex) =>
            currentItemIndex === itemIndex
              ? {
                  ...item,
                  [field]: field === "price" ? Number(value) : value,
                }
              : item,
          ),
        };
      }),
    }));
    setCopyState("idle");
  }

  function updateBillMoney(field: "shippingFee" | "discountTotal", value: string) {
    setBill((current) => ({
      ...current,
      [field]: Number(value),
    }));
    setCopyState("idle");
  }

  function addPerson() {
    setBill((current) => ({
      ...current,
      people: [
        ...current.people,
        {
          name: "Người mới",
          items: [{ name: "Món mới", price: 0 }],
        },
      ],
    }));
    setCopyState("idle");
  }

  function removePerson(personIndex: number) {
    setBill((current) => ({
      ...current,
      people: current.people.filter((_, index) => index !== personIndex),
    }));
    setCopyState("idle");
  }

  function addItem(personIndex: number) {
    setBill((current) => ({
      ...current,
      people: current.people.map((person, index) =>
        index === personIndex
          ? {
              ...person,
              items: [...person.items, { name: "Món mới", price: 0 }],
            }
          : person,
      ),
    }));
    setCopyState("idle");
  }

  function removeItem(personIndex: number, itemIndex: number) {
    setBill((current) => ({
      ...current,
      people: current.people.map((person, index) =>
        index === personIndex
          ? {
              ...person,
              items: person.items.filter(
                (_, currentItemIndex) => currentItemIndex !== itemIndex,
              ),
            }
          : person,
      ),
    }));
    setCopyState("idle");
  }

  async function copyResult() {
    const summary = [
      "🧾 Chia tiền trà sữa",
      "",
      `Tổng món: ${formatVnd(split.totalItems)}`,
      `Ship: ${formatVnd(bill.shippingFee)}`,
      `Giảm giá: ${formatVnd(bill.discountTotal)}`,
      `Số người: ${bill.people.length}`,
      "",
      "Mỗi người:",
      `- Ship: +${formatVnd(sharedShipping)}`,
      `- Giảm giá: -${formatVnd(sharedDiscount)}`,
      "",
      "Kết quả:",
      ...split.people.map(
        (person) => `${person.name}: ${formatVnd(person.finalTotal)}`,
      ),
      "",
      `Tổng thu: ${formatVnd(split.totalCollected)}`,
    ].join("\n");

    await navigator.clipboard.writeText(summary);
    setCopyState("copied");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-ink/10 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
          MVP mock extract
        </p>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          Chia tiền bill trà sữa
        </h1>
      </header>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-ink/10 bg-white/85 p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
              Ảnh bill
              <input
                accept="image/jpeg,image/png"
                className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setApiError(null);
                  setCopyState("idle");
                }}
              />
            </label>

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Preview bill đã chọn"
                className="aspect-[4/5] w-full rounded-md border border-ink/10 object-contain"
                src={previewUrl}
              />
            ) : (
              <div className="grid aspect-[4/5] place-items-center rounded-md border border-dashed border-ink/20 bg-milk text-sm text-ink/60">
                Chưa chọn ảnh
              </div>
            )}

            <button
              className="rounded-md bg-leaf px-4 py-2.5 font-semibold text-white transition hover:bg-leaf/90 disabled:cursor-not-allowed disabled:bg-ink/25"
              disabled={!selectedFile || isLoading}
              type="button"
              onClick={extractBill}
            >
              {isLoading ? "Đang đọc..." : "Đọc bill"}
            </button>

            {apiError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {apiError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-lg border border-ink/10 bg-white/85 p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Bill đã đọc</h2>
              <button
                className="rounded-md border border-leaf px-3 py-2 text-sm font-semibold text-leaf transition hover:bg-leaf hover:text-white"
                type="button"
                onClick={addPerson}
              >
                Thêm người
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {bill.people.map((person, personIndex) => (
                <div
                  className="rounded-md border border-ink/10 bg-milk/60 p-3"
                  key={`${personIndex}-${person.name}`}
                >
                  <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <label className="flex flex-col gap-1 text-sm font-semibold">
                      Người
                      <input
                        className="rounded-md border border-ink/20 bg-white px-3 py-2"
                        value={person.name}
                        onChange={(event) =>
                          updatePersonName(personIndex, event.target.value)
                        }
                      />
                    </label>
                    <button
                      className="self-end rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      type="button"
                      onClick={() => removePerson(personIndex)}
                    >
                      Xóa người
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {person.items.map((item, itemIndex) => (
                      <div
                        className="grid gap-2 sm:grid-cols-[1fr_150px_auto]"
                        key={`${itemIndex}-${item.name}`}
                      >
                        <label className="flex flex-col gap-1 text-sm">
                          Món
                          <input
                            className="rounded-md border border-ink/20 bg-white px-3 py-2"
                            value={item.name}
                            onChange={(event) =>
                              updateItem(
                                personIndex,
                                itemIndex,
                                "name",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          Giá
                          <input
                            className="rounded-md border border-ink/20 bg-white px-3 py-2"
                            type="number"
                            value={item.price}
                            onChange={(event) =>
                              updateItem(
                                personIndex,
                                itemIndex,
                                "price",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <button
                          className="self-end rounded-md border border-ink/20 px-3 py-2 text-sm font-semibold transition hover:bg-white"
                          type="button"
                          onClick={() => removeItem(personIndex, itemIndex)}
                        >
                          Xóa món
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="mt-3 rounded-md border border-ink/20 px-3 py-2 text-sm font-semibold transition hover:bg-white"
                    type="button"
                    onClick={() => addItem(personIndex)}
                  >
                    Thêm món
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Ship
                <input
                  className="rounded-md border border-ink/20 bg-white px-3 py-2"
                  type="number"
                  value={bill.shippingFee}
                  onChange={(event) =>
                    updateBillMoney("shippingFee", event.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Giảm giá
                <input
                  className="rounded-md border border-ink/20 bg-white px-3 py-2"
                  type="number"
                  value={bill.discountTotal}
                  onChange={(event) =>
                    updateBillMoney("discountTotal", event.target.value)
                  }
                />
              </label>
            </div>

            {[...bill.warnings, ...validationIssues].length > 0 ? (
              <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {[...bill.warnings, ...validationIssues].map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-ink/10 bg-white/85 p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Kết quả tính tiền</h2>
              <button
                className="rounded-md bg-tea px-3 py-2 text-sm font-semibold text-white transition hover:bg-tea/90 disabled:cursor-not-allowed disabled:bg-ink/25"
                disabled={!isValid}
                type="button"
                onClick={copyResult}
              >
                {copyState === "copied" ? "Đã copy" : "Copy kết quả"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {split.people.map((person) => (
                <div
                  className="rounded-md border border-ink/10 bg-milk/60 p-3"
                  key={person.name}
                >
                  <h3 className="font-bold">{person.name}</h3>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <dt>Tiền món</dt>
                    <dd className="text-right font-semibold">
                      {formatVnd(person.itemTotal)}
                    </dd>
                    <dt>Ship chia đều</dt>
                    <dd className="text-right font-semibold">
                      +{formatVnd(person.shippingShare)}
                    </dd>
                    <dt>Giảm giá chia đều</dt>
                    <dd className="text-right font-semibold">
                      -{formatVnd(person.discountShare)}
                    </dd>
                    <dt>Cần trả</dt>
                    <dd className="text-right text-lg font-bold text-leaf">
                      {formatVnd(person.finalTotal)}
                    </dd>
                  </dl>
                </div>
              ))}
            </div>

            <dl className="mt-4 grid gap-2 rounded-md bg-ink px-4 py-3 text-sm text-white sm:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt>Tổng món</dt>
                <dd className="font-semibold">{formatVnd(split.totalItems)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ship</dt>
                <dd className="font-semibold">{formatVnd(bill.shippingFee)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Giảm giá</dt>
                <dd className="font-semibold">
                  {formatVnd(bill.discountTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Tổng cần thu</dt>
                <dd className="font-semibold">
                  {formatVnd(split.expectedTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Tổng đã chia</dt>
                <dd className="font-semibold">
                  {formatVnd(split.totalCollected)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Sai lệch</dt>
                <dd className="font-semibold">{formatVnd(split.difference)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}
