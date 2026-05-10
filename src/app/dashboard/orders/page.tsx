import { getAllOrders } from "@/lib/actions/orders";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();
  return <OrdersClient orders={orders} />;
}
