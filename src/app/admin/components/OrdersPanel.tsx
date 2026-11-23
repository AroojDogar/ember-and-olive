
"use client";

import { useState } from "react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

type CustomerOrder = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  order_type: string;
  total_amount: string;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
};

const nextStatus: Partial<
  Record<OrderStatus, OrderStatus>
> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatPrice(value: string | number) {
  return Number(value).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ========================================
// EMBER & OLIVE — ORDERS MANAGEMENT
// Uses authenticated admin session
// ========================================

export default function OrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [updatingId, setUpdatingId] = useState<
    string | null
  >(null);

  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ======================================
  // 1. LOAD ORDERS USING LOGIN SESSION
  // ======================================

  async function loadOrders() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !Array.isArray(data.orders)
      ) {
        throw new Error(
          data.message || "Unable to load orders."
        );
      }

      setOrders(data.orders);
      setLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // 2. UPDATE ORDER STATUS
  // ======================================

  async function changeStatus(
    order: CustomerOrder,
    status: OrderStatus
  ) {
    if (status === "cancelled") {
      const confirmed = window.confirm(
        `Cancel order #${order.id}?`
      );

      if (!confirmed) return;
    }

    setError("");
    setMessage("");
    setUpdatingId(order.id);

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update order status."
        );
      }

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status }
            : item
        )
      );

      setMessage(
        `Order #${order.id} updated to ${statusLabels[status]}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ======================================
  // 3. FILTER ORDERS
  // ======================================

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) => order.status === filter
        );

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const activeCount = orders.filter(
    (order) =>
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return (
    <section className="mt-14 border border-[#CBAA78]/30 bg-[#17231B] p-6 text-[#F2ECE0] md:p-9">

      {/* SECTION HEADER */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#CBAA78]/25 pb-7">
        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#D7B780]">
            03 / RESTAURANT OPERATIONS
          </p>

          <h2 className="font-serif text-4xl md:text-5xl">
            Customer{" "}
            <i className="text-[#D7B780]">
              Orders.
            </i>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#AAB2A3]">
            Review incoming customer orders,
            manage preparation and track each
            order through completion.
          </p>
        </div>

        <button
          type="button"
          disabled={loading || updatingId !== null}
          onClick={() => void loadOrders()}
          className="bg-[#D7B780] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#101813] transition hover:bg-[#EFD3A1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "LOADING ORDERS..."
            : loaded
              ? "REFRESH ORDERS ↻"
              : "LOAD ORDERS ↗"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mb-6 border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div
          role="status"
          className="mb-6 border border-[#D7B780]/30 bg-[#D7B780]/10 p-4 text-sm text-[#F0D7A8]"
        >
          {message}
        </div>
      )}

      {/* DASHBOARD STATISTICS */}
      {loaded && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            {[
              {
                label: "TOTAL ORDERS",
                value: orders.length,
              },
              {
                label: "PENDING",
                value: pendingCount,
              },
              {
                label: "IN PROGRESS",
                value: activeCount,
              },
              {
                label: "COMPLETED",
                value: completedCount,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-[#CBAA78]/20 bg-[#101813] p-5"
              >
                <p className="text-[9px] uppercase tracking-[0.17em] text-[#CBAA78]">
                  {stat.label}
                </p>

                <p className="mt-4 font-serif text-3xl">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* STATUS FILTER */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <label
              htmlFor="orderStatusFilter"
              className="text-xs uppercase tracking-[0.18em] text-[#D7B780]"
            >
              Filter Orders
            </label>

            <select
              id="orderStatusFilter"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="min-w-52 border border-[#CBAA78]/30 bg-[#101813] px-4 py-3 text-sm text-white outline-none focus:border-[#D7B780]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </>
      )}

      {/* BEFORE FIRST LOAD */}
      {!loaded && !loading && (
        <div className="border border-dashed border-[#CBAA78]/25 px-6 py-16 text-center">
          <p className="font-serif text-3xl italic text-[#D7B780]">
            The order ledger awaits.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#AAB2A3]">
            Sign in to your Admin Dashboard,
            then select Load Orders to view
            customer purchases.
          </p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !loaded && (
        <p className="py-16 text-center text-sm text-[#AAB2A3]">
          Fetching orders from NeonDB...
        </p>
      )}

      {/* NO ORDERS */}
      {loaded && filteredOrders.length === 0 && (
        <div className="border border-dashed border-[#CBAA78]/25 px-6 py-16 text-center">
          <p className="font-serif text-3xl italic text-[#D7B780]">
            No orders found.
          </p>

          <p className="mt-4 text-sm text-[#AAB2A3]">
            Try another status filter or
            refresh the order list.
          </p>
        </div>
      )}

      {/* CUSTOMER ORDER CARDS */}
      {loaded && filteredOrders.length > 0 && (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {filteredOrders.map((order) => {
            const next = nextStatus[order.status];

            const canCancel = [
              "pending",
              "confirmed",
              "preparing",
              "ready",
            ].includes(order.status);

            const isUpdating =
              updatingId === order.id;

            return (
              <article
                key={order.id}
                className="border border-[#CBAA78]/25 bg-[#101813] p-5 md:p-7"
              >
                {/* ORDER HEADING */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#CBAA78]/20 pb-5">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#CBAA78]">
                      ORDER REFERENCE
                    </p>

                    <h3 className="font-serif text-4xl">
                      #{order.id}
                    </h3>

                    <p className="mt-3 text-xs text-[#99A596]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span className="border border-[#D7B780]/40 bg-[#D7B780]/10 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-[#D7B780]">
                    {statusLabels[order.status] ||
                      order.status}
                  </span>
                </div>

                {/* CUSTOMER INFORMATION */}
                <div className="grid gap-4 border-b border-[#CBAA78]/20 py-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#CBAA78]">
                      CUSTOMER
                    </p>

                    <p className="font-serif text-xl">
                      {order.customer_name}
                    </p>

                    <p className="mt-2 text-sm text-[#AAB2A3]">
                      {order.customer_phone || "No phone"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#CBAA78]">
                      ORDER TYPE
                    </p>

                    <p className="font-serif text-xl capitalize">
                      {order.order_type}
                    </p>
                  </div>
                </div>

                {/* ORDERED ITEMS */}
                <div className="py-6">
                  <p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-[#CBAA78]">
                    ORDERED DISHES
                  </p>

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-[#F2ECE0]">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-[#AAB2A3]">
                            {item.quantity} × PKR{" "}
                            {formatPrice(item.unit_price)}
                          </p>
                        </div>

                        <p className="shrink-0 text-[#D7B780]">
                          PKR{" "}
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* SPECIAL INSTRUCTIONS */}
                  {order.notes && (
                    <div className="mt-6 border-l-2 border-[#D7B780]/50 pl-4">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#CBAA78]">
                        SPECIAL INSTRUCTIONS
                      </p>

                      <p className="break-words text-sm leading-6 text-[#AAB2A3]">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* TOTAL */}
                <div className="flex items-center justify-between gap-4 border-y border-[#CBAA78]/20 py-5">
                  <span className="text-xs uppercase tracking-[0.18em] text-[#AAB2A3]">
                    ORDER TOTAL
                  </span>

                  <span className="font-serif text-2xl text-[#D7B780]">
                    PKR {formatPrice(order.total_amount)}
                  </span>
                </div>

                {/* STATUS BUTTONS */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {next && (
                    <button
                      type="button"
                      disabled={
                        loading || updatingId !== null
                      }
                      onClick={() =>
                        void changeStatus(order, next)
                      }
                      className="flex-1 bg-[#D7B780] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#101813] transition hover:bg-[#EFD3A1] disabled:opacity-50"
                    >
                      {isUpdating
                        ? "UPDATING..."
                        : `MARK ${statusLabels[next].toUpperCase()} ↗`}
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={
                        loading || updatingId !== null
                      }
                      onClick={() =>
                        void changeStatus(
                          order,
                          "cancelled"
                        )
                      }
                      className="border border-red-400/40 px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      CANCEL ORDER
                    </button>
                  )}

                  {!next && !canCancel && (
                    <p className="text-xs italic text-[#AAB2A3]">
                      No further status changes available.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-[#829080]">
        EMBER & OLIVE / SECURE ORDER OPERATIONS
      </p>
    </section>
  );
}
