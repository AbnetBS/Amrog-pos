import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Menu & Table Ordering • 4 Kilo",
  description:
    "Browse the Amrogn Chicken menu at Ambassador Mall, 4 Kilo: shawarma, roasted and grilled chicken, mofo, crispy fried chicken, burgers, combos and drinks. Check availability and order straight from your table.",
  alternates: {
    canonical: "/menu",
  },
};

export default function MenuLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
