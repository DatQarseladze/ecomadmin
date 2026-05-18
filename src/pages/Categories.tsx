import { Fragment, useMemo, useRef, useState } from "react";
import {
  AngleRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from "../icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  parentId: number | null;
  name: string;
  image: string;
  icon: string;
  order: number;
}

type FormMode = "create" | "edit";

interface FormState {
  mode: FormMode;
  category: Category | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_CHOICES = [
  "⚡", "💊", "💄", "🦷", "🧴", "🧷", "👶", "🛏️",
  "👕", "👟", "👜", "⌚", "💍", "🎮", "📱", "💻",
  "📷", "🎧", "🍼", "🧸", "🚲", "🏠", "🧹", "🎁",
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1,  parentId: null, name: "დედა და ბავშვი",        image: "",                  icon: "⚡", order: 1 },
  { id: 2,  parentId: null, name: "მედიკამენტები",          image: "",                  icon: "💊", order: 2 },
  { id: 3,  parentId: null, name: "დეკორატიული კოსმეტიკა", image: "",                  icon: "💄", order: 3 },
  { id: 4,  parentId: null, name: "პირის ღრუს მოვლა",      image: "",                  icon: "🦷", order: 4 },
  { id: 5,  parentId: null, name: "სუნამო",                image: "",                  icon: "🧴", order: 5 },
  { id: 10, parentId: 1,    name: "ჩვილის კვება",           image: "",                  icon: "🍼", order: 1 },
  { id: 11, parentId: 1,    name: "სათამაშოები",            image: "",                  icon: "🧸", order: 2 },
  { id: 12, parentId: 2,    name: "ვიტამინები",             image: "",                  icon: "💊", order: 1 },
  { id: 13, parentId: 3,    name: "სმარტფონები",            image: "",                  icon: "📱", order: 1 },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5";

// ─── Edit / Create modal ─────────────────────────────────────────────────────

interface CategoryFormProps {
  state: FormState;
  onSave: (data: Omit<Category, "id">, id: number) => void;
  onCancel: () => void;
}

function CategoryForm({ state, onSave, onCancel }: CategoryFormProps) {
  const editing = state.category;
  const [name, setName]   = useState(editing?.name  ?? "");
  const [order, setOrder] = useState(editing?.order ?? 1);
  const [image, setImage] = useState(editing?.image ?? "");
  const [icon, setIcon]   = useState(editing?.icon  ?? ICON_CHOICES[0]);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => setImage(URL.createObjectURL(file));

  const canSave = name.trim().length > 0 && editing?.id !== undefined;

  const handleSubmit = () => {
    if (!canSave || editing?.id === undefined) return;
    onSave(
      {
        parentId: editing.parentId ?? null,
        name: name.trim(),
        order,
        image,
        icon,
      },
      editing.id,
    );
  };

  const title = "რედაქტირება";

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-xl leading-none"
            aria-label="დახურვა"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>დასახელება</label>
            <input
              className={inputCls}
              placeholder="სმარტფონები"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              readOnly={state.mode === "edit"}
            />
          </div>

          <div>
            <label className={labelCls}>რიგითობა (order)</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={order}
              onChange={(e) => setOrder(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ფოტო</label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-[42px] flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors overflow-hidden"
              >
                {image ? (
                  <img src={image} alt="" className="max-h-full max-w-full object-contain rounded" />
                ) : (
                  <span className="text-gray-400">ფაილის არჩევა</span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="relative">
              <label className={labelCls}>ხატულა (icon)</label>
              <button
                type="button"
                onClick={() => setIconPickerOpen((v) => !v)}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="text-gray-400">(შეცვლა)</span>
              </button>
              {iconPickerOpen && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-2">
                  <div className="grid grid-cols-6 gap-1">
                    {ICON_CHOICES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setIcon(c); setIconPickerOpen(false); }}
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-base hover:bg-blue-50 dark:hover:bg-blue-900/20 ${c === icon ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400" : ""}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  category: Category;
  rowIndex: number;
  isSuper: boolean;
  expanded?: boolean;
  childCount?: number;
  onToggleExpand?: () => void;
  onMove: (id: number, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: (c: Category) => void;
}

function CategoryRow({
  category, rowIndex, isSuper, expanded, childCount,
  onToggleExpand, onMove, canMoveUp, canMoveDown, onEdit,
}: RowProps) {
  return (
    <tr className={`group border-l-2 ${isSuper ? "border-emerald-400/60 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-transparent"} hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors`}>
      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-mono w-12">{rowIndex}</td>
      <td className="px-4 py-3">
        <div className={`flex items-center gap-2 ${isSuper ? "" : "pl-8"}`}>
          {isSuper && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              aria-label={expanded ? "ჩაკეცვა" : "გაშლა"}
            >
              <span className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}>
                <AngleRightIcon className="w-3 h-3" />
              </span>
            </button>
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{category.name}</span>
          {isSuper && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              სუპერ
            </span>
          )}
          {isSuper && childCount !== undefined && childCount > 0 && (
            <span className="text-xs text-gray-400">({childCount})</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 w-24">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-700 dark:text-gray-300 w-4 text-center">{category.order}</span>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMove(category.id, -1)}
              disabled={!canMoveUp}
              className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="გადატანა ზემოთ"
            >
              <ChevronUpIcon className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onMove(category.id, 1)}
              disabled={!canMoveDown}
              className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="გადატანა ქვემოთ"
            >
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 w-20">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        )}
      </td>
      <td className="px-4 py-3 w-16">
        <div className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-base bg-white dark:bg-gray-900">
          {category.icon || "—"}
        </div>
      </td>
      <td className="px-4 py-3 w-32">
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title="რედაქტირება"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([1]));
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);

  const supers = useMemo(
    () => categories.filter((c) => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories],
  );

  const childrenOf = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);

  const matchesSearch = (c: Category) => c.name.toLowerCase().includes(search.toLowerCase());

  const visibleSupers = useMemo(() => {
    if (!search.trim()) return supers;
    return supers.filter((s) => matchesSearch(s) || childrenOf(s.id).some(matchesSearch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supers, categories, search]);

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openEdit = (category: Category) => setForm({ mode: "edit", category });
  const closeForm = () => setForm(null);

  const saveCategory = (data: Omit<Category, "id">, id: number) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    closeForm();
  };

  const moveCategory = (id: number, direction: -1 | 1) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const siblings = categories
      .filter((c) => c.parentId === target.parentId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((c) => c.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const a = siblings[idx];
    const b = siblings[swapIdx];
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === a.id) return { ...c, order: b.order };
        if (c.id === b.id) return { ...c, order: a.order };
        return c;
      }),
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">კატეგორიების მართვა</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            სუპერ კატეგორიების და შიდა კატეგორიების ნახვა და რედაქტირება
          </p>
        </div>
      </div>

      {/* List card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">კატეგორიების სია</span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
              {supers.length}
            </span>
          </div>
          <div className="relative max-w-xs w-full">
            <input
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-9 pr-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ძიება..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-left border-b border-gray-100 dark:border-gray-800">
              <tr>
                {["#", "დასახელება", "რიგ.", "ფოტო", "ხატულა", "მოქმ."].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleSupers.map((sup, sIdx) => {
                const children = childrenOf(sup.id);
                const isExpanded = expanded.has(sup.id);
                const visibleChildren = search.trim()
                  ? children.filter((c) => matchesSearch(c) || matchesSearch(sup))
                  : children;
                return (
                  <Fragment key={sup.id}>
                    <CategoryRow
                      category={sup}
                      rowIndex={sIdx + 1}
                      isSuper
                      expanded={isExpanded}
                      childCount={children.length}
                      onToggleExpand={() => toggleExpanded(sup.id)}
                      onMove={moveCategory}
                      canMoveUp={sIdx > 0}
                      canMoveDown={sIdx < visibleSupers.length - 1}
                      onEdit={openEdit}
                    />
                    {isExpanded &&
                      visibleChildren.map((child, cIdx) => (
                        <CategoryRow
                          key={child.id}
                          category={child}
                          rowIndex={cIdx + 1}
                          isSuper={false}
                          onMove={moveCategory}
                          canMoveUp={cIdx > 0}
                          canMoveDown={cIdx < visibleChildren.length - 1}
                          onEdit={openEdit}
                        />
                      ))}
                    {isExpanded && visibleChildren.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 pl-16 text-xs text-gray-400 dark:text-gray-500">
                          ქვეკატეგორიები არ არის
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {visibleSupers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    კატეგორიები ვერ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && <CategoryForm state={form} onSave={saveCategory} onCancel={closeForm} />}
    </div>
  );
}
