
"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

type MenuItem = {
  id: number | string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  is_available: boolean;
};

type CartEntry = {
  id: string;
  quantity: number;
};

type CartView = "cart" | "checkout" | "success";

type OrderReceipt = {
  id: string;
  total: string;
  status: string;
};

const CART_STORAGE_KEY = "ember-olive-cart-v1";

function formatPrice(value: number) {
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const inputClass =
  "w-full border border-[#CDAE78]/30 bg-[#0D1510] px-4 py-4 text-sm text-[#F2EBDD] outline-none placeholder:text-[#829080] focus:border-[#CDAE78]";

const labelClass =
  "mb-2 block text-xs tracking-wide text-[#E2D2B8]";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartView, setCartView] =
    useState<CartView>("cart");

  const [notice, setNotice] = useState("");

  // CUSTOMER INFORMATION
  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [orderType, setOrderType] =
    useState<"pickup" | "dine-in">("pickup");

  const [notes, setNotes] = useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [checkoutError, setCheckoutError] =
    useState("");

  const [receipt, setReceipt] =
    useState<OrderReceipt | null>(null);

  // ====================================
  // LOAD LIVE MENU
  // ====================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadMenu() {
      try {
        const response = await fetch("/api/menu", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load menu."
          );
        }

        setItems(data.items);
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "The menu is currently unavailable."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadMenu();

    return () => controller.abort();
  }, []);

  // ====================================
  // RESTORE CART
  // ====================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const restored: CartEntry[] = [];
          const seen = new Set<string>();

          for (const entry of parsed) {
            if (
              !entry ||
              typeof entry !== "object" ||
              typeof entry.id !== "string" ||
              !/^[1-9]\d*$/.test(entry.id) ||
              !Number.isSafeInteger(Number(entry.id)) ||
              !Number.isInteger(entry.quantity) ||
              entry.quantity < 1 ||
              entry.quantity > 10 ||
              seen.has(entry.id)
            ) {
              continue;
            }

            seen.add(entry.id);

            restored.push({
              id: entry.id,
              quantity: entry.quantity,
            });

            if (restored.length >= 20) break;
          }

          setCart(restored);
        }
      }
    } catch {
      // Ignore invalid saved cart data.
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch {
      // Cart works during this session.
    }
  }, [cart, cartReady]);

  // ====================================
  // CART DRAWER CONTROLS
  // ====================================

  function openCart() {
    setCartView("cart");
    setCheckoutError("");
    setCartOpen(true);
  }

  function closeCart() {
    if (placingOrder) return;

    setCartOpen(false);
    setCartView("cart");
  }

  useEffect(() => {
    if (!cartOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onEscape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !placingOrder
      ) {
        setCartOpen(false);
        setCartView("cart");
      }
    }

    document.addEventListener(
      "keydown",
      onEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        onEscape
      );
    };
  }, [cartOpen, placingOrder]);

  // ====================================
  // ADD TO CART
  // ====================================

  function addToCart(item: MenuItem) {
    const id = String(item.id);

    const existing = cart.find(
      (entry) => entry.id === id
    );

    if (existing && existing.quantity >= 10) {
      setNotice("Maximum 10 portions per dish.");
      return;
    }

    if (!existing && cart.length >= 20) {
      setNotice(
        "Maximum 20 different dishes per order."
      );
      return;
    }

    setCart((current) => {
      const found = current.find(
        (entry) => entry.id === id
      );

      if (found) {
        return current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                quantity: Math.min(
                  entry.quantity + 1,
                  10
                ),
              }
            : entry
        );
      }

      return [
        ...current,
        { id, quantity: 1 },
      ];
    });

    setNotice(
      `${item.name} added to your cart.`
    );
  }

  function updateQuantity(
    id: string,
    next: number
  ) {
    setCart((current) => {
      if (next <= 0) {
        return current.filter(
          (entry) => entry.id !== id
        );
      }

      return current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              quantity: Math.min(next, 10),
            }
          : entry
      );
    });
  }

  function removeFromCart(id: string) {
    setCart((current) =>
      current.filter(
        (entry) => entry.id !== id
      )
    );
  }

  // ====================================
  // FILTER MENU
  // ====================================

  const availableItems = items.filter(
    (item) => item.is_available
  );

  const categories = [
    "All",
    ...Array.from(
      new Set(
        availableItems.map(
          (item) => item.category
        )
      )
    ),
  ];

  const query = search.trim().toLowerCase();

  const filteredItems = availableItems.filter(
    (item) =>
      (category === "All" ||
        item.category === category) &&
      (item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query))
  );

  // ====================================
  // CALCULATE CART TOTALS
  // ====================================

  const cartRows = cart.map((entry) => ({
    ...entry,
    dish: items.find(
      (item) =>
        String(item.id) === entry.id
    ),
  }));

  const cartCount = cart.reduce(
    (sum, entry) =>
      sum + entry.quantity,
    0
  );

  const cartTotal = cartRows.reduce(
    (sum, row) => {
      if (!row.dish?.is_available) {
        return sum;
      }

      return (
        sum +
        Number(row.dish.price) *
          row.quantity
      );
    },
    0
  );

  const hasUnavailable = cartRows.some(
    (row) =>
      !row.dish ||
      !row.dish.is_available
  );

  const canCheckout =
    !loading &&
    !error &&
    cartRows.length > 0 &&
    !hasUnavailable &&
    cartTotal > 0;

  // ====================================
  // PLACE CUSTOMER ORDER
  // ====================================

  async function placeOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCheckoutError("");

    if (!canCheckout || placingOrder) {
      setCheckoutError(
        "Please review your cart before placing an order."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customerName:
              customerName.trim(),
            customerPhone:
              customerPhone.trim(),
            orderType,
            notes: notes.trim(),
            items: cart.map(
              (entry) => ({
                id: Number(entry.id),
                quantity: entry.quantity,
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.order
      ) {
        throw new Error(
          data.message ||
            "Unable to place order."
        );
      }

      setReceipt({
        id: String(data.order.id),
        total: String(data.order.total),
        status: String(data.order.status),
      });

      // CLEAR CART AFTER SUCCESS ONLY
      setCart([]);
      setNotice("");
      setNotes("");
      setCartView("success");
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0D1510] text-[#F2EBDD]">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-30 border-b border-[#CDAE78]/20 bg-[#0D1510]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 lg:px-12">
          <Link
            href="/"
            className="font-serif text-2xl tracking-wide md:text-3xl"
          >
            EMBER{" "}
            <i className="text-[#CDAE78]">
              &
            </i>{" "}
            OLIVE
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden border border-[#CDAE78]/30 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[#CDAE78] hover:border-[#CDAE78] sm:inline-flex"
            >
              HOME
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="bg-[#CDAE78] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#101813] transition hover:bg-[#E9CF9F]"
            >
              VIEW CART ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#CDAE78]/15 px-6 py-20 text-center md:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#B99459]/10 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-7 text-[10px] uppercase tracking-[0.4em] text-[#CDAE78]">
            EMBER & OLIVE / THE COLLECTION
          </p>

          <h1 className="font-serif text-6xl leading-tight md:text-8xl">
            A Taste of{" "}
            <span className="italic text-[#CDAE78]">
              Excellence.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-8 text-[#A6B1A2]">
            Discover extraordinary flavors,
            thoughtfully curated ingredients
            and the finest culinary creations.
          </p>

          <div className="mx-auto mt-12 h-px w-24 bg-[#CDAE78]/70" />
        </div>
      </section>

      {/* DYNAMIC MENU */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#CDAE78]">
              THE ART OF DINING
            </p>

            <h2 className="font-serif text-4xl md:text-6xl">
              Our{" "}
              <i className="text-[#CDAE78]">
                Menu.
              </i>
            </h2>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-[#A6B1A2]">
            {availableItems.length} Culinary Creations
          </p>
        </div>

        {/* SEARCH */}
        <input
          type="search"
          aria-label="Search dishes"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search our culinary collection..."
          className={`${inputClass} mb-8 md:max-w-lg`}
        />

        {/* CATEGORY FILTERS */}
        <div className="mb-14 flex flex-wrap gap-3">
          {categories.map(
            (itemCategory) => (
              <button
                key={itemCategory}
                type="button"
                onClick={() =>
                  setCategory(itemCategory)
                }
                className={`border px-5 py-3 text-[10px] uppercase tracking-[0.15em] transition ${
                  category === itemCategory
                    ? "border-[#CDAE78] bg-[#CDAE78] text-[#101813]"
                    : "border-[#CDAE78]/25 text-[#CDAE78] hover:border-[#CDAE78]"
                }`}
              >
                {itemCategory}
              </button>
            )
          )}
        </div>

        {/* ADD TO CART NOTIFICATION */}
        {notice && (
          <div
            role="status"
            className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-[#CDAE78]/35 bg-[#CDAE78]/10 px-5 py-4 text-sm text-[#EBD4AA]"
          >
            <span>{notice}</span>

            <button
              type="button"
              onClick={openCart}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4"
            >
              VIEW CART
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="py-28 text-center font-serif text-3xl italic text-[#CDAE78]">
            Preparing your experience...
          </p>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="py-24 text-center"
          >
            <p className="font-serif text-3xl text-[#CDAE78]">
              Unable to Load Menu
            </p>

            <p className="mt-4 text-sm text-[#A6B1A2]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 border border-[#CDAE78] px-6 py-3 text-xs text-[#CDAE78]"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* DISH CARDS */}
        {!loading && !error && (
          <>
            {filteredItems.length === 0 ? (
              <div className="py-28 text-center">
                <p className="font-serif text-3xl italic text-[#CDAE78]">
                  No dishes found.
                </p>

                <p className="mt-4 text-sm text-[#A6B1A2]">
                  Try another category or search.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map(
                  (item, index) => {
                    const inCart = cart.find(
                      (entry) =>
                        entry.id ===
                        String(item.id)
                    );

                    return (
                      <article
                        key={item.id}
                        className="group flex flex-col overflow-hidden border border-[#CDAE78]/20 bg-[#152019] transition-all duration-500 hover:-translate-y-2 hover:border-[#CDAE78]/60 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                      >
                        <div className="relative h-72 overflow-hidden bg-[#233026]">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-serif text-3xl italic text-[#CDAE78]/60">
                              Ember & Olive
                            </div>
                          )}

                          <div className="absolute left-5 top-5 bg-[#101813]/90 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-[#CDAE78]">
                            {item.category}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-7">
                          <p className="mb-5 text-[10px] tracking-[0.2em] text-[#CDAE78]">
                            COLLECTION{" "}
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </p>

                          <h3 className="font-serif text-3xl leading-tight">
                            {item.name}
                          </h3>

                          <p className="mt-4 flex-1 text-sm leading-7 text-[#9FAC9D]">
                            {item.description}
                          </p>

                          <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#CDAE78]/20 pt-6">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#9FAC9D]">
                              Signature Price
                            </span>

                            <span className="font-serif text-xl text-[#E5C894]">
                              PKR{" "}
                              {formatPrice(
                                Number(item.price)
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(item)
                            }
                            disabled={
                              inCart?.quantity === 10
                            }
                            className="mt-6 w-full bg-[#CDAE78] px-5 py-4 text-xs font-semibold uppercase tracking-[0.17em] text-[#101813] transition hover:bg-[#EBD4AA] disabled:opacity-50"
                          >
                            {inCart?.quantity === 10
                              ? "MAXIMUM QUANTITY"
                              : "ADD TO CART +"}
                          </button>

                          {inCart && (
                            <p className="mt-3 text-center text-xs text-[#CDAE78]">
                              {inCart.quantity} portions
                              in your cart
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#CDAE78]/20 px-6 py-12 text-center">
        <p className="font-serif text-2xl">
          EMBER{" "}
          <i className="text-[#CDAE78]">
            &
          </i>{" "}
          OLIVE
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-[#849083]">
          An Extraordinary Dining Experience
        </p>
      </footer>

      {/* ====================================
          CART / CHECKOUT / CONFIRMATION
      ==================================== */}

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close cart"
            disabled={placingOrder}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cartHeading"
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-[#CDAE78]/35 bg-[#122017] shadow-2xl"
          >
            {/* PANEL HEADER */}
            <div className="flex items-start justify-between gap-4 border-b border-[#CDAE78]/20 px-6 py-7">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[#CDAE78]">
                  EMBER & OLIVE
                </p>

                <h2
                  id="cartHeading"
                  className="font-serif text-4xl"
                >
                  {cartView === "cart" && (
                    <>
                      Your{" "}
                      <i className="text-[#CDAE78]">
                        Cart.
                      </i>
                    </>
                  )}

                  {cartView === "checkout" && (
                    <>
                      Your{" "}
                      <i className="text-[#CDAE78]">
                        Order.
                      </i>
                    </>
                  )}

                  {cartView === "success" && (
                    <>
                      Order{" "}
                      <i className="text-[#CDAE78]">
                        Received.
                      </i>
                    </>
                  )}
                </h2>
              </div>

              <button
                type="button"
                disabled={placingOrder}
                onClick={closeCart}
                aria-label="Close"
                className="border border-[#CDAE78]/30 px-4 py-2 text-xl text-[#CDAE78] hover:bg-[#CDAE78]/10 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {/* ============================
                CART VIEW
            ============================ */}

            {cartView === "cart" && (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-7">
                  {cartRows.length === 0 ? (
                    <div className="py-20 text-center">
                      <h3 className="font-serif text-3xl italic text-[#CDAE78]">
                        Your table awaits.
                      </h3>

                      <p className="mt-4 text-sm text-[#A6B1A2]">
                        Add your favorite dishes
                        from our menu.
                      </p>

                      <button
                        type="button"
                        onClick={closeCart}
                        className="mt-8 border border-[#CDAE78] px-6 py-4 text-xs text-[#CDAE78]"
                      >
                        EXPLORE MENU
                      </button>
                    </div>
                  ) : (
                    cartRows.map((row) => (
                      <div
                        key={row.id}
                        className="border border-[#CDAE78]/20 bg-[#18271C] p-4"
                      >
                        <div className="flex gap-4">
                          {row.dish?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={
                                row.dish.image_url
                              }
                              alt={row.dish.name}
                              className="h-24 w-24 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-[#273629] text-center font-serif text-sm italic text-[#CDAE78]">
                              Ember & Olive
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-[0.14em] text-[#CDAE78]">
                              {row.dish?.category ||
                                "Unavailable"}
                            </p>

                            <h3 className="mt-2 font-serif text-xl">
                              {row.dish?.name ||
                                "Dish unavailable"}
                            </h3>

                            <p className="mt-3 text-sm text-[#E5C894]">
                              {row.dish?.is_available
                                ? `PKR ${formatPrice(
                                    Number(
                                      row.dish.price
                                    ) *
                                      row.quantity
                                  )}`
                                : "Unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#CDAE78]/15 pt-4">
                          <div className="flex items-center border border-[#CDAE78]/30">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                updateQuantity(
                                  row.id,
                                  row.quantity - 1
                                )
                              }
                              className="px-4 py-2 text-[#CDAE78]"
                            >
                              −
                            </button>

                            <span className="min-w-8 text-center text-sm">
                              {row.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={
                                row.quantity >= 10
                              }
                              onClick={() =>
                                updateQuantity(
                                  row.id,
                                  row.quantity + 1
                                )
                              }
                              className="px-4 py-2 text-[#CDAE78] disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(row.id)
                            }
                            className="text-[10px] uppercase tracking-[0.12em] text-red-300 underline underline-offset-4"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cartRows.length > 0 && (
                  <div className="border-t border-[#CDAE78]/30 bg-[#0F1A13] px-6 py-7">
                    {hasUnavailable && (
                      <p
                        role="alert"
                        className="mb-4 text-xs text-amber-200"
                      >
                        Remove unavailable dishes
                        before checkout.
                      </p>
                    )}

                    <div className="flex items-end justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#A6B1A2]">
                        Estimated Total
                      </p>

                      <p className="font-serif text-3xl text-[#E5C894]">
                        PKR{" "}
                        {formatPrice(
                          cartTotal
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canCheckout}
                      onClick={() => {
                        setCheckoutError("");
                        setCartView("checkout");
                      }}
                      className="mt-6 w-full bg-[#CDAE78] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#101813] transition hover:bg-[#EBD4AA] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      PROCEED TO CHECKOUT ↗
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ============================
                CHECKOUT VIEW
            ============================ */}

            {cartView === "checkout" && (
              <div className="flex-1 overflow-y-auto px-6 py-7">
                <button
                  type="button"
                  disabled={placingOrder}
                  onClick={() => {
                    setCheckoutError("");
                    setCartView("cart");
                  }}
                  className="mb-8 text-xs text-[#CDAE78] disabled:opacity-40"
                >
                  ← BACK TO CART
                </button>

                <form
                  id="customerCheckout"
                  onSubmit={placeOrder}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="customerName"
                      className={labelClass}
                    >
                      Full Name
                    </label>

                    <input
                      id="customerName"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={150}
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className={labelClass}
                    >
                      Contact Number
                    </label>

                    <input
                      id="customerPhone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={30}
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(
                          event.target.value
                        )
                      }
                      placeholder="03XX XXXXXXX"
                      className={inputClass}
                    />
                  </div>

                  <fieldset>
                    <legend className={labelClass}>
                      Order Type
                    </legend>

                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          {
                            value: "pickup",
                            label: "PICKUP",
                          },
                          {
                            value: "dine-in",
                            label: "DINE-IN",
                          },
                        ] as const
                      ).map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer border px-4 py-4 text-center text-xs tracking-[0.15em] transition ${
                            orderType ===
                            option.value
                              ? "border-[#CDAE78] bg-[#CDAE78] text-[#0D1510]"
                              : "border-[#CDAE78]/30 text-[#CDAE78]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="orderType"
                            value={option.value}
                            checked={
                              orderType ===
                              option.value
                            }
                            onChange={() =>
                              setOrderType(
                                option.value
                              )
                            }
                            className="sr-only"
                          />

                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="orderNotes"
                      className={labelClass}
                    >
                      Special Instructions
                      (Optional)
                    </label>

                    <textarea
                      id="orderNotes"
                      rows={3}
                      maxLength={500}
                      value={notes}
                      onChange={(event) =>
                        setNotes(
                          event.target.value
                        )
                      }
                      placeholder="Any preferences for your order?"
                      className={inputClass}
                    />
                  </div>

                  <div className="border border-[#CDAE78]/25 bg-[#19281D] p-5">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#CDAE78]">
                      ORDER SUMMARY
                    </p>

                    {cartRows.map((row) => (
                      <div
                        key={row.id}
                        className="mb-3 flex justify-between gap-4 text-sm text-[#D8DDCF]"
                      >
                        <span>
                          {row.dish?.name ||
                            "Unavailable"}{" "}
                          × {row.quantity}
                        </span>

                        <span className="shrink-0 text-[#E5C894]">
                          {row.dish?.is_available
                            ? `PKR ${formatPrice(
                                Number(
                                  row.dish.price
                                ) *
                                  row.quantity
                              )}`
                            : "N/A"}
                        </span>
                      </div>
                    ))}

                    <div className="mt-5 flex items-center justify-between border-t border-[#CDAE78]/25 pt-5">
                      <span className="text-xs uppercase tracking-[0.14em]">
                        Estimated Total
                      </span>

                      <span className="font-serif text-2xl text-[#E5C894]">
                        PKR{" "}
                        {formatPrice(
                          cartTotal
                        )}
                      </span>
                    </div>

                    <p className="mt-4 text-xs leading-6 text-[#A6B1A2]">
                      Final prices are verified
                      by the restaurant server.
                    </p>
                  </div>

                  {checkoutError && (
                    <p
                      role="alert"
                      className="border border-red-400/40 bg-red-950/30 p-4 text-sm leading-6 text-red-200"
                    >
                      {checkoutError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={
                      placingOrder ||
                      !canCheckout
                    }
                    className="w-full bg-[#CDAE78] px-5 py-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#101813] transition hover:bg-[#EBD4AA] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {placingOrder
                      ? "PLACING ORDER..."
                      : "CONFIRM & PLACE ORDER ↗"}
                  </button>

                  <p className="text-center text-xs leading-6 text-[#A6B1A2]">
                    Your order will be submitted
                    with Pending status. Payment
                    is not collected online.
                  </p>
                </form>
              </div>
            )}

            {/* ============================
                ORDER SUCCESS VIEW
            ============================ */}

            {cartView === "success" &&
              receipt && (
                <div
                  role="status"
                  className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-12 text-center"
                >
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#CDAE78] text-4xl text-[#CDAE78]">
                    ✓
                  </div>

                  <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#CDAE78]">
                    ORDER CONFIRMATION
                  </p>

                  <h3 className="font-serif text-4xl">
                    Thank You.
                  </h3>

                  <p className="mt-5 max-w-sm text-sm leading-8 text-[#A6B1A2]">
                    Your order has been received
                    and recorded successfully.
                  </p>

                  <div className="mt-9 w-full border border-[#CDAE78]/30 bg-[#19281D] p-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#A6B1A2]">
                      ORDER NUMBER
                    </p>

                    <p className="mt-3 font-serif text-4xl text-[#CDAE78]">
                      #{receipt.id}
                    </p>

                    <div className="mt-6 flex justify-between gap-4 border-t border-[#CDAE78]/20 pt-5 text-sm">
                      <span>Total</span>

                      <span className="text-[#E5C894]">
                        PKR{" "}
                        {formatPrice(
                          Number(receipt.total)
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between gap-4 text-sm">
                      <span>Status</span>

                      <span className="uppercase tracking-wider text-[#E5C894]">
                        {receipt.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-[#A6B1A2]">
                    Please keep your order number
                    for reference.
                  </p>

                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-9 w-full bg-[#CDAE78] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#101813]"
                  >
                    BACK TO MENU
                  </button>
                </div>
              )}
          </aside>
        </div>
      )}
    </main>
  );
}
