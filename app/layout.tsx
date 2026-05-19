import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "八字排盘 · 四柱十神",
  description: "输入出生阳历年月日时，自动排出四柱八字与十神",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
