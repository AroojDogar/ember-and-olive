
"use client";

import OrdersPanel from "./components/OrdersPanel";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
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

type DishForm = {
  name: string;
  price: string;
  description: string;
  category: string;
};

type PhotoDraft = {
  dishId: string;
  file: File;
  preview: string;
};

const categories = [
  "Signature",
  "Starters",
  "Main Course",
  "Steaks",
  "Desserts",
  "Beverages",
];

const emptyForm: DishForm = {
  name: "",
  price: "",
  description: "",
  category: "Signature",
};

const inputStyle =
  "w-full border border-[#CBAA78]/25 bg-[#101813] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#788574] focus:border-[#D7B780]";

const labelStyle =
  "mb-2 block text-xs text-[#D8CCB8]";

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [uploadingId, setUploadingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] =
    useState<DishForm>({ ...emptyForm });

  const [editItem, setEditItem] =
    useState<MenuItem | null>(null);

  const [editForm, setEditForm] =
    useState<DishForm>({ ...emptyForm });

  const [photoDraft, setPhotoDraft] =
    useState<PhotoDraft | null>(null);

  const [search, setSearch] = useState("");

  const busy =
    saving ||
    updating ||
    deletingId !== null ||
    uploadingId !== null;

  // FETCH MENU
  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/menu", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load menu."
        );
      }

      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dishes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function clearNotices() {
    setError("");
    setMessage("");
  }

  // ADD DISH USING ADMIN SESSION
  async function addDish(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearNotices();
    setSaving(true);

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to add dish."
        );
      }

      setForm({ ...emptyForm });
      await loadItems();
      setMessage("Dish added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add dish."
      );
    } finally {
      setSaving(false);
    }
  }

  // OPEN EDIT FORM
  function openEdit(item: MenuItem) {
    clearNotices();
    setEditItem(item);

    setEditForm({
      name: item.name,
      price: String(item.price),
      description: item.description,
      category: item.category,
    });
  }

  // UPDATE DISH USING ADMIN SESSION
  async function updateDish(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editItem) return;

    clearNotices();
    setUpdating(true);

    try {
      const response = await fetch("/api/menu", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editItem.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update dish."
        );
      }

      setEditItem(null);
      await loadItems();
      setMessage("Dish updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update dish."
      );
    } finally {
      setUpdating(false);
    }
  }

  // DELETE DISH USING ADMIN SESSION
  async function deleteDish(item: MenuItem) {
    clearNotices();

    const confirmed = window.confirm(
      `Permanently delete "${item.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(String(item.id));

    try {
      const response = await fetch("/api/menu", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete dish."
        );
      }

      if (photoDraft?.dishId === String(item.id)) {
        setPhotoDraft(null);
      }

      await loadItems();
      setMessage("Dish deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete dish."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // SELECT PHOTO AND CREATE PREVIEW
  function selectPhoto(
    item: MenuItem,
    event: ChangeEvent<HTMLInputElement>
  ) {
    clearNotices();

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError("Select a JPG, PNG or WebP photo.");
      return;
    }

    if (
      file.size === 0 ||
      file.size > 3 * 1024 * 1024
    ) {
      setError("Photo must be 3 MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoDraft({
          dishId: String(item.id),
          file,
          preview: reader.result,
        });
      }
    };

    reader.onerror = () => {
      setError("Unable to preview selected photo.");
    };

    reader.readAsDataURL(file);
  }

  // UPLOAD PHOTO USING ADMIN SESSION
  async function uploadPhoto(item: MenuItem) {
    clearNotices();

    if (
      !photoDraft ||
      photoDraft.dishId !== String(item.id)
    ) {
      setError("Choose a photo first.");
      return;
    }

    setUploadingId(String(item.id));

    try {
      const uploadData = new FormData();

      uploadData.append("dishId", String(item.id));
      uploadData.append("file", photoDraft.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      setItems((current) =>
        current.map((dish) =>
          String(dish.id) === String(item.id)
            ? {
                ...dish,
                image_url: data.image_url,
              }
            : dish
        )
      );

      setPhotoDraft(null);
      await loadItems();

      setMessage(
        `"${item.name}" photo uploaded and saved.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploadingId(null);
    }
  }

  // STATISTICS AND SEARCH
  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const totalCategories = new Set(
    items.map((item) => item.category)
  ).size;

  const availableDishes = items.filter(
    (item) => item.is_available
  ).length;

  return (
    <main className="min-h-screen bg-[#101813] text-[#F2ECE0]">
      {/* HEADER */}
      <header className="border-b border-[#CBAA78]/20 bg-[#142018]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-7 lg:px-12">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">
              EMBER{" "}
              <i className="text-[#D7B780]">&</i>{" "}
              OLIVE
            </h1>

            <p className="mt-2 text-[9px] uppercase tracking-[0.35em] text-[#CBAA78]">
              Royal Restaurant Management
            </p>
          </div>

          <a
            href="/"
            className="border border-[#CBAA78]/50 px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-[#D7B780] transition hover:bg-[#D7B780] hover:text-[#101813]"
          >
            View Website ↗
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-12 lg:py-16">
        {/* PAGE INTRO */}
        <div className="mb-12">
          <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-[#D7B780]">
            MANAGEMENT SUITE / 001
          </p>

          <h2 className="font-serif text-5xl leading-tight md:text-7xl">
            The Culinary{" "}
            <i className="text-[#D7B780]">
              Collection.
            </i>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#AAB2A3]">
            Add, edit and curate your restaurant menu.
            Upload signature food photography and
            manage everything through NeonDB.
          </p>
        </div>

        {/* DASHBOARD STATS */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "TOTAL DISHES",
              value: items.length,
            },
            {
              label: "MENU CATEGORIES",
              value: totalCategories,
            },
            {
              label: "AVAILABLE DISHES",
              value: availableDishes,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#CBAA78]/25 bg-[#19261D] p-7"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#CBAA78]">
                {stat.label}
              </p>

              <p className="mt-5 font-serif text-5xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* STATUS MESSAGES */}
        {error && (
          <div
            role="alert"
            className="mb-7 border border-red-400/40 bg-red-950/30 p-5 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-7 border border-[#D7B780]/40 bg-[#D7B780]/10 p-5 text-sm text-[#F1D9AE]"
          >
            {message}
          </div>
        )}

        <div className="grid items-start gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          {/* ADD DISH */}
          <section className="border border-[#CBAA78]/30 bg-[#17231B] p-6 md:p-9">
            <div className="mb-8 border-b border-[#CBAA78]/25 pb-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#D7B780]">
                01 / MENU MANAGEMENT
              </p>

              <h3 className="font-serif text-4xl">
                Add a{" "}
                <i className="text-[#D7B780]">
                  New Dish.
                </i>
              </h3>
            </div>

            <form
              onSubmit={addDish}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="dishName"
                  className={labelStyle}
                >
                  Dish Name
                </label>

                <input
                  id="dishName"
                  className={inputStyle}
                  required
                  maxLength={150}
                  placeholder="Royal Truffle Risotto"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dishPrice"
                    className={labelStyle}
                  >
                    Price (PKR)
                  </label>

                  <input
                    id="dishPrice"
                    className={inputStyle}
                    type="number"
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    required
                    placeholder="2500"
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="dishCategory"
                    className={labelStyle}
                  >
                    Category
                  </label>

                  <select
                    id="dishCategory"
                    className={inputStyle}
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="dishDescription"
                  className={labelStyle}
                >
                  Description
                </label>

                <textarea
                  id="dishDescription"
                  className={inputStyle}
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="Describe your signature creation..."
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#D7B780] px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#111A13] transition hover:bg-[#F0D6A8] disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : "ADD DISH TO MENU ↗"}
              </button>
            </form>
          </section>

          {/* LIVE MENU */}
          <section className="border border-[#CBAA78]/30 bg-[#17231B] p-6 md:p-9">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#CBAA78]/25 pb-6">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#D7B780]">
                  02 / DATABASE COLLECTION
                </p>

                <h3 className="font-serif text-4xl">
                  Live{" "}
                  <i className="text-[#D7B780]">
                    Menu.
                  </i>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearNotices();
                  void loadItems();
                }}
                className="text-xs text-[#D7B780] hover:text-white"
              >
                Refresh ↻
              </button>
            </div>

            <input
              type="search"
              className={`${inputStyle} mb-6`}
              placeholder="Search dishes or categories..."
              aria-label="Search menu"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {loading ? (
              <p className="py-16 text-center text-sm text-[#AAB2A3]">
                Loading dishes from NeonDB...
              </p>
            ) : items.length === 0 ? (
              <div className="border border-dashed border-[#CBAA78]/30 px-5 py-20 text-center">
                <p className="font-serif text-3xl italic text-[#D7B780]">
                  Your collection awaits.
                </p>

                <p className="mt-4 text-sm text-[#AAB2A3]">
                  Add your first dish using the form.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="py-16 text-center text-sm text-[#AAB2A3]">
                No matching dishes found.
              </p>
            ) : (
              <div className="space-y-5">
                {filteredItems.map((item, index) => {
                  const selectedPhoto =
                    photoDraft?.dishId === String(item.id)
                      ? photoDraft
                      : null;

                  const isUploading =
                    uploadingId === String(item.id);

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden border border-[#CBAA78]/20 bg-[#101813] transition hover:border-[#D7B780]/50"
                    >
                      {/* STORED DISH PHOTO */}
                      {item.image_url ? (
                        <div className="relative h-48 overflow-hidden bg-[#233226]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute bottom-3 left-3 bg-[#101813]/90 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-[#D7B780]">
                            Signature Photography
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-[#1A281E]">
                          <div className="text-center">
                            <p className="font-serif text-3xl italic text-[#D7B780]">
                              Awaiting a portrait.
                            </p>

                            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#829080]">
                              No dish photo uploaded
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <span className="font-serif text-2xl text-[#D7B780]">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-[#D7B780]">
                              {item.category}
                            </p>

                            <h4 className="font-serif text-2xl">
                              {item.name}
                            </h4>

                            <p className="mt-3 text-xs leading-6 text-[#AAB2A3]">
                              {item.description}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-[#D7B780]">
                              PKR{" "}
                              {Number(
                                item.price
                              ).toLocaleString("en-PK")}
                            </p>
                          </div>
                        </div>

                        {/* PHOTO MANAGEMENT */}
                        <div className="mt-6 border-t border-[#CBAA78]/20 pt-5">
                          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#D7B780]">
                            Dish Photography
                          </p>

                          <input
                            id={`photo-${item.id}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={busy}
                            className="sr-only"
                            onChange={(event) =>
                              selectPhoto(item, event)
                            }
                          />

                          <label
                            htmlFor={`photo-${item.id}`}
                            className={`inline-block border border-[#D7B780]/40 px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-[#D7B780] transition hover:bg-[#D7B780]/10 ${
                              busy
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                          >
                            {item.image_url
                              ? "CHANGE PHOTO"
                              : "CHOOSE PHOTO"}
                          </label>

                          <p className="mt-3 text-xs text-[#8E9B8A]">
                            JPG, PNG or WebP · Max 3 MB
                          </p>

                          {/* SELECTED PHOTO PREVIEW */}
                          {selectedPhoto && (
                            <div className="mt-5 border border-[#D7B780]/30 bg-[#1A281E] p-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedPhoto.preview}
                                alt="Selected dish photo preview"
                                className="h-44 w-full object-cover"
                              />

                              <p className="mt-3 break-all text-xs text-[#D8CCB8]">
                                {selectedPhoto.file.name}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    void uploadPhoto(item)
                                  }
                                  className="flex-1 bg-[#D7B780] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111A13] transition hover:bg-[#F0D6A8] disabled:opacity-50"
                                >
                                  {isUploading
                                    ? "UPLOADING..."
                                    : "UPLOAD PHOTO ↗"}
                                </button>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    setPhotoDraft(null)
                                  }
                                  className="border border-[#CBAA78]/40 px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-[#D7B780] disabled:opacity-50"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* EDIT & DELETE */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#CBAA78]/20 pt-5">
                          <span className="text-[9px] uppercase tracking-[0.15em] text-[#829080]">
                            ID: {item.id}
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => openEdit(item)}
                              className="border border-[#D7B780]/50 px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-[#D7B780] hover:bg-[#D7B780] hover:text-[#101813] disabled:opacity-50"
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void deleteDish(item)
                              }
                              className="border border-red-400/40 px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-red-300 hover:bg-red-500/15 disabled:opacity-50"
                            >
                              {deletingId === String(item.id)
                                ? "DELETING..."
                                : "DELETE"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <OrdersPanel />

        <p className="mt-14 text-center text-[10px] uppercase tracking-[0.2em] text-[#788578]">
          EMBER & OLIVE — ROYAL RESTAURANT MANAGEMENT SYSTEM
        </p>
      </div>

      {/* EDIT DISH MODAL */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-8 backdrop-blur-md">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="editTitle"
            className="my-auto w-full max-w-xl border border-[#D7B780]/50 bg-[#17231B] p-6 md:p-10"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#D7B780]">
                  ROYAL MENU EDITOR
                </p>

                <h3
                  id="editTitle"
                  className="font-serif text-4xl"
                >
                  Edit{" "}
                  <i className="text-[#D7B780]">
                    Dish.
                  </i>
                </h3>
              </div>

              <button
                type="button"
                disabled={updating}
                onClick={() => setEditItem(null)}
                aria-label="Close edit form"
                className="text-2xl text-[#D7B780] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={updateDish}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="editName"
                  className={labelStyle}
                >
                  Dish Name
                </label>

                <input
                  id="editName"
                  className={inputStyle}
                  required
                  maxLength={150}
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      name: event.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="editPrice"
                    className={labelStyle}
                  >
                    Price (PKR)
                  </label>

                  <input
                    id="editPrice"
                    className={inputStyle}
                    type="number"
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        price: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="editCategory"
                    className={labelStyle}
                  >
                    Category
                  </label>

                  <select
                    id="editCategory"
                    className={inputStyle}
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        category: event.target.value,
                      })
                    }
                  >
                    {!categories.includes(
                      editForm.category
                    ) && (
                      <option value={editForm.category}>
                        {editForm.category}
                      </option>
                    )}

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="editDescription"
                  className={labelStyle}
                >
                  Description
                </label>

                <textarea
                  id="editDescription"
                  className={inputStyle}
                  rows={4}
                  maxLength={1000}
                  required
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-[#D7B780] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#111A13] disabled:opacity-50"
                >
                  {updating
                    ? "SAVING..."
                    : "SAVE CHANGES ↗"}
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setEditItem(null)}
                  className="border border-[#CBAA78]/40 px-5 py-4 text-xs uppercase tracking-[0.15em] text-[#D7B780] disabled:opacity-50"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
