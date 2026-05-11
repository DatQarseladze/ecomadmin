import { useState, useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

// ─── Flatpickr Input ───────────────────────────────────────────────────────────

interface FlatpickrInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

function FlatpickrInput({ value, onChange, placeholder = "თარიღი", minDate, maxDate, className }: FlatpickrInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: "Y-m-d",
      allowInput: true,
      minDate,
      maxDate,
      onChange: ([date]) => {
        if (date) {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          onChange(`${y}-${m}-${d}`);
        }
      },
    }) as flatpickr.Instance;
    return () => fpRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fpRef.current?.setDate(value || "", false);
  }, [value]);

  return (
    <div className="relative">
      <input ref={inputRef} readOnly placeholder={placeholder} className={className} defaultValue={value} />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <CalendarIcon />
      </span>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CustomGroupType {
  id: number;
  name: string;
  color: string;
}

interface GroupFilters {
  countries: string[];
  brands: string[];
  categories: string[];
  genders: string[];
  isSaleOnly: boolean;
  isWebOnly: boolean;
}

interface GroupProduct {
  id: number;
  name: string;
  qty: number;
}

interface HomepageGroup {
  id: number;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  order: number;
  active: boolean;
  filters: GroupFilters;
  products: GroupProduct[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_COLOR_OPTIONS = [
  "#F97316", "#3B82F6", "#EF4444", "#22C55E",
  "#8B5CF6", "#F59E0B", "#1D4ED8", "#DC2626",
];

let nextTypeId = 7;

const INITIAL_TYPES: CustomGroupType[] = [
  { id: 1, name: "Popular", color: "#3B82F6" },
  { id: 2, name: "Best Sellers", color: "#8B5CF6" },
  { id: 3, name: "New Arrivals", color: "#22C55E" },
  { id: 4, name: "Seasonal", color: "#F97316" },
  { id: 5, name: "Featured", color: "#06B6D4" },
  { id: 6, name: "Sale", color: "#EF4444" },
];

const COUNTRY_OPTIONS = ["საქართველო", "გერმანია", "საფრანგეთი", "იტალია", "ესპანეთი", "ამერიკა", "დიდი ბრიტანეთი", "თურქეთი", "ჩინეთი", "იაპონია", "კანადა", "ავსტრალია"];
const BRAND_OPTIONS = ["Nike", "Adidas", "Puma", "Zara", "H&M", "Mango", "Calvin Klein", "Tommy Hilfiger", "Gucci", "Armani", "Versace", "Burberry"];
const CATEGORY_OPTIONS = ["ფეხსაცმელი", "ტანსაცმელი", "აქსესუარები", "ჩანთები", "სათვალეები", "სპორტული", "ელეგანტური", "ბავშვური"];
const GENDER_OPTIONS = ["მამრობითი", "მდედრობითი", "უნისექსი", "საბავშვო"];

const SAMPLE_PRODUCTS: GroupProduct[] = [
  { id: 1, name: "Nike Air Max 270", qty: 1 },
  { id: 2, name: "Adidas Ultraboost 22", qty: 2 },
  { id: 3, name: "Puma RS-X", qty: 3 },
  { id: 4, name: "Zara Linen Shirt", qty: 4 },
  { id: 5, name: "H&M Cotton Dress", qty: 5 },
  { id: 6, name: "Mango Silk Blouse", qty: 6 },
  { id: 7, name: "Calvin Klein Jeans", qty: 7 },
  { id: 8, name: "Tommy Hilfiger Polo", qty: 8 },
  { id: 9, name: "Gucci Belt", qty: 9 },
  { id: 10, name: "Louis Vuitton Bag", qty: 10 },
];

const defaultFilters = (): GroupFilters => ({
  countries: [], brands: [], categories: [], genders: [],
  isSaleOnly: false, isWebOnly: false,
});

const defaultGroup = (): Omit<HomepageGroup, "id"> => ({
  title: "", type: "", startDate: "", endDate: "",
  order: 1, active: true,
  filters: defaultFilters(),
  products: SAMPLE_PRODUCTS.map(p => ({ ...p })),
});

let nextId = 4;

const INITIAL_GROUPS: HomepageGroup[] = [
  {
    id: 1, title: "ზაფხულის კოლექცია", type: "Seasonal",
    startDate: "2025-06-01", endDate: "2025-08-31",
    order: 1, active: true,
    filters: { countries: ["საქართველო"], brands: ["Nike", "Adidas"], categories: [], genders: [], isSaleOnly: false, isWebOnly: false },
    products: SAMPLE_PRODUCTS.slice(0, 5).map(p => ({ ...p })),
  },
  {
    id: 2, title: "ვებაბური სერია", type: "Featured",
    startDate: "2025-01-01", endDate: "2025-12-31",
    order: 2, active: true,
    filters: defaultFilters(),
    products: SAMPLE_PRODUCTS.slice(0, 4).map(p => ({ ...p })),
  },
  {
    id: 3, title: "შავი პარასკევი", type: "Sale",
    startDate: "2025-11-25", endDate: "2025-11-30",
    order: 3, active: false,
    filters: defaultFilters(),
    products: SAMPLE_PRODUCTS.slice(0, 8).map(p => ({ ...p })),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const selectCls = "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 10 16" fill="currentColor">
    <circle cx="3" cy="2" r="1.2" /><circle cx="7" cy="2" r="1.2" />
    <circle cx="3" cy="8" r="1.2" /><circle cx="7" cy="8" r="1.2" />
    <circle cx="3" cy="14" r="1.2" /><circle cx="7" cy="14" r="1.2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const FolderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const PersonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Filter Panel ───────────────────────────────────────────────────────────────

type MultiKey = "countries" | "brands" | "categories" | "genders";

interface FilterSection {
  key: MultiKey;
  label: string;
  icon: React.ReactNode;
  options: string[];
  isChips?: boolean;
}

const FILTER_SECTIONS: FilterSection[] = [
  { key: "countries", label: "ქვეყანა", icon: <GlobeIcon />, options: COUNTRY_OPTIONS },
  { key: "brands", label: "ბრენდი", icon: <TagIcon />, options: BRAND_OPTIONS },
  { key: "categories", label: "კატეგორია", icon: <FolderIcon />, options: CATEGORY_OPTIONS },
  { key: "genders", label: "სქესი", icon: <PersonIcon />, options: GENDER_OPTIONS, isChips: true },
];

interface FilterPanelProps {
  filters: GroupFilters;
  onChange: (f: GroupFilters) => void;
}

function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [searches, setSearches] = useState<Record<string, string>>({});

  const activeSectionCount = [
    filters.countries.length > 0,
    filters.brands.length > 0,
    filters.categories.length > 0,
    filters.genders.length > 0,
    filters.isSaleOnly || filters.isWebOnly,
  ].filter(Boolean).length;

  const toggle = (key: string) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const toggleVal = (key: MultiKey, val: string) => {
    const arr = filters[key];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">ფილტრები</span>
        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
          {activeSectionCount}
        </span>
      </div>

      {FILTER_SECTIONS.map(sec => {
        const count = filters[sec.key].length;
        const isOpen = !!open[sec.key];
        const q = searches[sec.key] ?? "";
        const opts = sec.options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
        const selected = filters[sec.key];

        return (
          <div key={sec.key} className="border-b border-gray-100 dark:border-gray-800">
            <button
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              onClick={() => toggle(sec.key)}
            >
              <span className="text-gray-400">{sec.icon}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{sec.label}</span>
              {count > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">{count}</span>
              )}
              <ChevronDownIcon className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-3 space-y-2">
                {/* Selected chips */}
                {selected.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.map(v => (
                      <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        {v}
                        <button onClick={() => toggleVal(sec.key, v)} className="hover:opacity-70"><XIcon size={8} /></button>
                      </span>
                    ))}
                  </div>
                )}

                {sec.isChips ? (
                  <div className="flex flex-wrap gap-1.5">
                    {sec.options.map(opt => {
                      const active = selected.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleVal(sec.key, opt)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${active ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"
                            }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                      <input
                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-7 pr-3 py-1.5 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="ძებნა..."
                        value={q}
                        onChange={e => setSearches(p => ({ ...p, [sec.key]: e.target.value }))}
                      />
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {opts.slice(0, 8).map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group py-0.5">
                          <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={() => toggleVal(sec.key, opt)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{opt}</span>
                        </label>
                      ))}
                      {opts.length > 8 && (
                        <p className="text-xs text-gray-400 pt-1">{opts.length - 8} სხვა...</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* სხვა section */}
      <div>
        <button
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
          onClick={() => toggle("other")}
        >
          <span className="text-gray-400"><StarIcon /></span>
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">სხვა</span>
          {(filters.isSaleOnly || filters.isWebOnly) && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
              {(filters.isSaleOnly ? 1 : 0) + (filters.isWebOnly ? 1 : 0)}
            </span>
          )}
          <ChevronDownIcon className={`text-gray-400 transition-transform duration-200 ${open["other"] ? "rotate-180" : ""}`} />
        </button>
        {open["other"] && (
          <div className="px-4 pb-3 space-y-3">
            {([
              { key: "isSaleOnly" as const, label: "სააქციო" },
              { key: "isWebOnly" as const, label: "ვებური" },
            ] as const).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                <button
                  onClick={() => onChange({ ...filters, [key]: !filters[key] })}
                  className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none ${filters[key] ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters[key] ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Products Panel ─────────────────────────────────────────────────────────────

interface ProductsPanelProps {
  products: GroupProduct[];
  onChange: (p: GroupProduct[]) => void;
}

function ProductsPanel({ products, onChange }: ProductsPanelProps) {
  const [search, setSearch] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const visible = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const setQty = (id: number, qty: number) =>
    onChange(products.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p));

  const remove = (id: number) => onChange(products.filter(p => p.id !== id));

  const onDragStart = (realIdx: number) => setDragIdx(realIdx);
  const onDragOver = (e: React.DragEvent, realIdx: number) => { e.preventDefault(); setOverIdx(realIdx); };
  const onDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    const arr = [...products];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(dropIdx, 0, moved);
    onChange(arr);
    setDragIdx(null);
    setOverIdx(null);
  };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">პროდუქტები</span>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">{products.length}</span>
        </div>
        <span className="text-xs text-gray-400">ფილტრებით განახლება</span>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          <input
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-8 pr-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="პროდუქტის ძებნა..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[24px_1fr_112px_24px] gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/40">
        <div />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">დასახელება</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">მიმდევრობა</span>
        <div />
      </div>

      {/* Rows */}
      <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50" style={{ maxHeight: 380 }}>
        {visible.map(product => {
          const realIdx = products.findIndex(p => p.id === product.id);
          return (
            <div
              key={product.id}
              draggable
              onDragStart={() => onDragStart(realIdx)}
              onDragOver={e => onDragOver(e, realIdx)}
              onDrop={e => onDrop(e, realIdx)}
              onDragEnd={onDragEnd}
              className={`grid grid-cols-[24px_1fr_112px_24px] items-center gap-2 px-4 py-2.5 transition-colors ${overIdx === realIdx ? "bg-blue-50 dark:bg-blue-900/10" :
                  dragIdx === realIdx ? "opacity-50 bg-gray-50 dark:bg-gray-800/50" :
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                }`}
            >
              <span className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing"><DragIcon /></span>
              <span className="text-sm text-gray-800 dark:text-white/90 truncate">{product.name}</span>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(product.id, product.qty - 1)}
                  className="w-7 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-light transition-colors flex-shrink-0"
                >−</button>
                <input
                  type="number" min={1} value={product.qty}
                  onChange={e => setQty(product.id, Number(e.target.value))}
                  className="w-full text-center text-xs font-mono border-none outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 h-8 p-0"
                />
                <button
                  onClick={() => setQty(product.id, product.qty + 1)}
                  className="w-7 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-light transition-colors flex-shrink-0"
                >+</button>
              </div>
              <button onClick={() => remove(product.id)} className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors flex items-center justify-center">
                <XIcon size={10} />
              </button>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">პროდუქტები არ მოიძებნა</p>
        )}
      </div>
    </div>
  );
}

// ─── Form View ─────────────────────────────────────────────────────────────────

interface FormViewProps {
  mode: "create" | "edit";
  group: Omit<HomepageGroup, "id">;
  types: CustomGroupType[];
  onChange: (g: Omit<HomepageGroup, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
}

function FormView({ mode, group, types, onChange, onSave, onCancel }: FormViewProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <h1 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "ჯგუფის რედაქტირება" : "ახალი ჯგუფი"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            გაუქმება
          </button>
          <button
            onClick={onSave}
            disabled={!group.title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <CheckIcon />
            შენახვა
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 space-y-5">

        {/* ── Main fields card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>სათაური <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                placeholder="ჯგუფის სახელი"
                value={group.title}
                onChange={e => onChange({ ...group, title: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>ჯგუფის ტიპი</label>
              <select
                className={inputCls + " cursor-pointer"}
                value={group.type}
                onChange={e => onChange({ ...group, type: e.target.value })}
              >
                <option value="">ტიპის არჩევა</option>
                {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>დამატება</label>
              <FlatpickrInput
                value={group.startDate}
                onChange={v => onChange({ ...group, startDate: v })}
                maxDate={group.endDate || undefined}
                className={`${inputCls} pr-9`}
              />
            </div>
            <div>
              <label className={labelCls}>დასრულება</label>
              <FlatpickrInput
                value={group.endDate}
                onChange={v => onChange({ ...group, endDate: v })}
                minDate={group.startDate || undefined}
                className={`${inputCls} pr-9`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div>
              <label className={labelCls}>მიმდევრობა</label>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-28">
                <button
                  onClick={() => onChange({ ...group, order: Math.max(1, group.order - 1) })}
                  className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg font-light transition-colors flex-shrink-0"
                >−</button>
                <input
                  type="number" min={1} value={group.order}
                  onChange={e => onChange({ ...group, order: Math.max(1, Number(e.target.value)) })}
                  className="w-full text-center text-sm font-mono border-none outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 h-10 p-0"
                />
                <button
                  onClick={() => onChange({ ...group, order: group.order + 1 })}
                  className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg font-light transition-colors flex-shrink-0"
                >+</button>
              </div>
            </div>

            <div>
              <label className={labelCls}>სტატუსი</label>
              <button
                onClick={() => onChange({ ...group, active: !group.active })}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${group.active
                    ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  }`}
              >
                <span className={`relative w-9 h-5 rounded-full transition-colors ${group.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${group.active ? "translate-x-4" : "translate-x-0"}`} />
                </span>
                <span className={group.active ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>
                  {group.active ? "აქტიური" : "გათიშული"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Filters + Products ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
          <FilterPanel filters={group.filters} onChange={f => onChange({ ...group, filters: f })} />
          <ProductsPanel products={group.products} onChange={p => onChange({ ...group, products: p })} />
        </div>
      </div>
    </div>
  );
}

// ─── Type Modal ─────────────────────────────────────────────────────────────────

interface TypeModalProps {
  mode: "create" | "edit";
  data: { name: string; color: string };
  onChange: (d: { name: string; color: string }) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TypeModal({ mode, data, onChange, onSave, onCancel }: TypeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">
          {mode === "edit" ? "ტიპის ჩასწორება" : "ახალი ტიპი"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>ტიპის სახელი</label>
            <input
              className={inputCls}
              placeholder="ტიპის სახელი"
              value={data.name}
              onChange={e => onChange({ ...data, name: e.target.value })}
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>ფერი</label>
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              {TYPE_COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => onChange({ ...data, color: c })}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    boxShadow: data.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                    transform: data.color === c ? "scale(1.15)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            გაუქმება
          </button>
          <button
            onClick={onSave}
            disabled={!data.name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">წაშლის დადასტურება</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          დარწმუნებული ხართ, რომ გსურთ{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">„{name}"</span> წაშლა?
          ეს მოქმედება შეუქცევადია.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            გაუქმება
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
            წაშლა
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function HomepageLayoutPage() {
  const [groups, setGroups] = useState<HomepageGroup[]>(INITIAL_GROUPS);
  const [customTypes, setCustomTypes] = useState<CustomGroupType[]>(INITIAL_TYPES);
  const [view, setView] = useState<"list" | "form">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<Omit<HomepageGroup, "id">>(defaultGroup());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomepageGroup | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");

  // Type management modal state
  const [typeModalMode, setTypeModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeModalData, setTypeModalData] = useState({ name: "", color: TYPE_COLOR_OPTIONS[0] });
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<CustomGroupType | null>(null);

  const filtered = groups.filter(g => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && g.type !== typeFilter) return false;
    if (statusFilter === "active" && !g.active) return false;
    if (statusFilter === "inactive" && g.active) return false;
    return true;
  });

  const openCreate = () => {
    setFormData(defaultGroup());
    setEditingId(null);
    setFormMode("create");
    setView("form");
  };

  const openEdit = (g: HomepageGroup) => {
    const { id, ...rest } = g;
    setFormData(rest);
    setEditingId(id);
    setFormMode("edit");
    setView("form");
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (formMode === "edit" && editingId !== null) {
      setGroups(prev => prev.map(g => g.id === editingId ? { id: editingId, ...formData } : g));
    } else {
      setGroups(prev => [...prev, { id: nextId++, ...formData }]);
    }
    setView("list");
  };

  const toggleActive = (id: number) =>
    setGroups(prev => prev.map(g => g.id === id ? { ...g, active: !g.active } : g));

  const doDelete = () => {
    if (deleteTarget) {
      setGroups(prev => prev.filter(g => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  // Type management handlers
  const openCreateType = () => {
    setTypeModalData({ name: "", color: TYPE_COLOR_OPTIONS[0] });
    setEditingTypeId(null);
    setTypeModalMode("create");
  };

  const openEditType = (t: CustomGroupType) => {
    setTypeModalData({ name: t.name, color: t.color });
    setEditingTypeId(t.id);
    setTypeModalMode("edit");
  };

  const handleSaveType = () => {
    if (!typeModalData.name.trim()) return;
    if (typeModalMode === "edit" && editingTypeId !== null) {
      setCustomTypes(prev => prev.map(t => t.id === editingTypeId ? { ...t, ...typeModalData } : t));
    } else {
      setCustomTypes(prev => [...prev, { id: nextTypeId++, ...typeModalData }]);
    }
    setTypeModalMode(null);
  };

  const doDeleteType = () => {
    if (deleteTypeTarget) {
      setCustomTypes(prev => prev.filter(t => t.id !== deleteTypeTarget.id));
      setDeleteTypeTarget(null);
    }
  };

  // ── Form view ──
  if (view === "form") {
    return (
      <FormView
        mode={formMode}
        group={formData}
        types={customTypes}
        onChange={setFormData}
        onSave={handleSave}
        onCancel={() => setView("list")}
      />
    );
  }

  // ── List view ──
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">პროდუქტის ჯგუფები</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ჯგუფის შექმნა, ფილტრაცია და პროდუქტების მიმდევრობა</p>
      </div>


      {/* Type Management Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ტიპების მართვა</span>
          <button
            onClick={openCreateType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon />
            ახალი ტიპი
          </button>
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-3">
          {customTypes.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.name}</span>
              <button
                onClick={() => openEditType(t)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-0.5"
                title="რედაქტირება"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setDeleteTypeTarget(t)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="წაშლა"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {customTypes.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-1">ტიპები არ არის. დაამატეთ პირველი ტიპი.</p>
          )}
        </div>
      </div>

      {/* Groups Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ჯგუფის სია</span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
              <input
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-8 pr-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                placeholder="ჯგუფის ძებნა..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className={selectCls}
            >
              <option value="">ყველა ტიპი</option>
              {customTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as "" | "active" | "inactive")}
              className={selectCls}
            >
              <option value="">ყველა სტატუსი</option>
              <option value="active">აქტიური</option>
              <option value="inactive">გათიშული</option>
            </select>
            {/* New group button */}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PlusIcon />
              ახალი ჯგუფი
            </button>
          </div>
        </div>



        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <tr>
                {["#", "დასახელება", "ტიპი", "პერიოდი", "სტატუსი", ""].map((h, i) => (
                  <th key={i} className="px-5 py-3 font-medium text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, idx) => {
                const typeObj = customTypes.find(t => t.name === g.type);
                return (
                  <tr key={g.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 font-mono text-xs w-10">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-800 dark:text-white/90">{g.title}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {typeObj ? (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: hexToRgba(typeObj.color, 0.12), color: typeObj.color }}
                        >
                          {typeObj.name}
                        </span>
                      ) : g.type ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {g.type}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                      {g.startDate && g.endDate ? `${fmtDate(g.startDate)} – ${fmtDate(g.endDate)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(g.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${g.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${g.active ? "bg-green-500" : "bg-gray-400"}`} />
                        {g.active ? "აქტიური" : "გათიშული"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          title="რედაქტირება"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(g)}
                          className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="წაშლა"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    ჯგუფები არ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group delete modal */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.title}
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Type create/edit modal */}
      {typeModalMode && (
        <TypeModal
          mode={typeModalMode}
          data={typeModalData}
          onChange={setTypeModalData}
          onSave={handleSaveType}
          onCancel={() => setTypeModalMode(null)}
        />
      )}

      {/* Type delete modal */}
      {deleteTypeTarget && (
        <DeleteConfirm
          name={deleteTypeTarget.name}
          onConfirm={doDeleteType}
          onCancel={() => setDeleteTypeTarget(null)}
        />
      )}
    </div>
  );
}
