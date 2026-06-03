import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chia bill trà sữa",
  description: "MVP chia tiền bill trà sữa từ ảnh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
