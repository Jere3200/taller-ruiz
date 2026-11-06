import type { Metadata } from "next";
import { OrdersBoard } from "@/components/panel/OrdersBoard";

export const metadata: Metadata = { title: "Órdenes" };

export default function PanelPage() {
  return <OrdersBoard />;
}
