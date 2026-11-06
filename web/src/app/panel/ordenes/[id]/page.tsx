import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetailView } from "@/components/panel/OrderDetailView";

export const metadata: Metadata = { title: "Detalle de la orden" };

// `params` is a runtime value: with Cache Components it is read under <Suspense>.
async function Detail({ params }: { params: PageProps<"/panel/ordenes/[id]">["params"] }) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}

export default function OrderPage({ params }: PageProps<"/panel/ordenes/[id]">) {
  return (
    <Suspense fallback={<div className="p-8" aria-busy="true" />}>
      <Detail params={params} />
    </Suspense>
  );
}
