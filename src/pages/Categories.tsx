import { useMemo, useState, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon, FolderIcon, TrashBinIcon, PencilIcon, PlusIcon } from "../icons";

interface Category {
  id: number;
  name: string;
  image: string;
  order: number;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "მთავარი კატეგორია", image: "", order: 1 },
  { id: 2, name: "ტანსაცმელი", image: "", order: 2 },
  { id: 3, name: "ფეხსაცმელი", image: "", order: 3 },
];

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

let nextCategoryId = 100;

function CategoryForm({
  mode,
  category,
  onSave,
  onCancel,
}: {
  mode: "create" | "edit";
  category: Category | null;
  onSave: (data: Omit<Category, "id">, id?: number) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [order, setOrder] = useState(category?.order ?? 1);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-2xl mx-4 p-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {mode === "edit" ? "კატეგორიის რედაქტირება" : "ახალი კატეგორია"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              შეგიძლიათ დაამატოთ, დაარედაქტიროთ და დაალაგოთ კატეგორიები.
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>დასახელება</label>
            <input
              className={inputCls}
              placeholder="კატეგორიის სახელი"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>რიგითობა</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={order}
              onChange={(e) => setOrder(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>სურათი</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-950"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-blue-600">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">ფაილის ატვირთვა ან გადაგდება აქ</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG</p>
                </div>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            {image && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <img src={image} alt="category" className="w-full h-44 object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={() => onSave({ name: name.trim(), image, order }, category?.id)}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const displayed = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const openCreate = () => {
    setFormMode("create");
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setFormMode("edit");
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Category, "id">, id?: number) => {
    if (formMode === "edit" && id != null) {
      setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...data } : category)));
    } else {
      setCategories((prev) => [...prev, { id: nextCategoryId++, ...data }]);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("ნამდვილად გსურთ კატეგორიის წაშლა?")) return;
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const moveOrder = (id: number, direction: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((category) => category.id === id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const currentOrder = sorted[index].order;
    const targetOrder = sorted[swapIndex].order;
    setCategories((prev) => prev.map((category) => {
      if (category.id === sorted[index].id) return { ...category, order: targetOrder };
      if (category.id === sorted[swapIndex].id) return { ...category, order: currentOrder };
      return category;
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">კატეგორიების მართვა</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">აქ შეგიძლიათ შეექმნათ, დაარედაქტიროთ, წაშალოთ და დაიალაგოთ საიტზე არსებული კატეგორიები.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          ახალი კატეგორია
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-md">
            <input
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="კატეგორიის დასახელება..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-left border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['#', 'დასახელება', 'სურათი', 'რიგითობა', 'მოქმედება'].map((head) => (
                  <th key={head} className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {displayed.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-gray-400 dark:text-gray-500 font-mono">{category.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800 dark:text-white/90">{category.name}</div>
                  </td>
                  <td className="px-5 py-4">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-16 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-700 dark:text-gray-300">{category.order}</span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveOrder(category.id, -1)}
                          disabled={index === 0}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveOrder(category.id, 1)}
                          disabled={index === displayed.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                        title="რედაქტირება"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        title="წაშლა"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    კატეგორიები ვერ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <CategoryForm
          mode={formMode}
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
