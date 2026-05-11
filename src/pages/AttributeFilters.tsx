import { useState, useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterDataType    = "clickable" | "boolean" | "text" | "range" | "color";
type FilterDisplayType = "alphabetical_checkbox" | "checkbox" | "multi_select" | "radio" | "range_slider";

interface FilterValue {
  id: number;
  label: string;
  order: number;
  active: boolean;
}

interface AttributeFilter {
  id: number;
  name: string;
  type: FilterDataType;
  isGlobal: boolean;
  order: number;
  filterType: FilterDisplayType;
  active: boolean;
  values: FilterValue[];
}

// ─── Type badge config ─────────────────────────────────────────────────────────

const DATA_TYPE_CLS: Record<FilterDataType, string> = {
  clickable: "text-blue-600   dark:text-blue-400",
  boolean:   "text-amber-600  dark:text-amber-400",
  text:      "text-green-600  dark:text-green-400",
  range:     "text-purple-600 dark:text-purple-400",
  color:     "text-rose-600   dark:text-rose-400",
};

// ─── Sample data ───────────────────────────────────────────────────────────────

const INITIAL: AttributeFilter[] = [
  {
    id: 1, name: "ბრენდი", type: "clickable", isGlobal: true, order: 2,
    filterType: "alphabetical_checkbox", active: true,
    values: [
      { id: 1, label: "Nike",           order: 1, active: true  },
      { id: 2, label: "Adidas",         order: 2, active: true  },
      { id: 3, label: "Puma",           order: 3, active: true  },
      { id: 4, label: "Zara",           order: 4, active: true  },
      { id: 5, label: "H&M",            order: 5, active: false },
      { id: 6, label: "Calvin Klein",   order: 6, active: true  },
    ],
  },
  {
    id: 3, name: "ფასდაკლებული პროდუქტები", type: "boolean", isGlobal: false, order: 1,
    filterType: "checkbox", active: true,
    values: [
      { id: 7, label: "დიახ", order: 1, active: true },
      { id: 8, label: "არა",  order: 2, active: true },
    ],
  },
  {
    id: 5, name: "ფასი", type: "range", isGlobal: true, order: 3,
    filterType: "range_slider", active: true,
    values: [],
  },
  {
    id: 7, name: "ფერი", type: "color", isGlobal: true, order: 4,
    filterType: "checkbox", active: false,
    values: [
      { id:  9, label: "შავი",    order: 1, active: true  },
      { id: 10, label: "თეთრი",   order: 2, active: true  },
      { id: 11, label: "წითელი",  order: 3, active: true  },
      { id: 12, label: "ლურჯი",   order: 4, active: true  },
      { id: 13, label: "მწვანე",  order: 5, active: false },
    ],
  },
  {
    id: 9, name: "ზომა", type: "clickable", isGlobal: true, order: 5,
    filterType: "multi_select", active: true,
    values: [
      { id: 14, label: "XS",  order: 1, active: true  },
      { id: 15, label: "S",   order: 2, active: true  },
      { id: 16, label: "M",   order: 3, active: true  },
      { id: 17, label: "L",   order: 4, active: true  },
      { id: 18, label: "XL",  order: 5, active: true  },
      { id: 19, label: "XXL", order: 6, active: false },
    ],
  },
  {
    id: 11, name: "კატეგორია", type: "clickable", isGlobal: true, order: 6,
    filterType: "alphabetical_checkbox", active: true,
    values: [
      { id: 20, label: "ტანსაცმელი",   order: 1, active: true },
      { id: 21, label: "ფეხსაცმელი",   order: 2, active: true },
      { id: 22, label: "აქსესუარები",  order: 3, active: true },
    ],
  },
  {
    id: 13, name: "სქესი", type: "clickable", isGlobal: false, order: 7,
    filterType: "radio", active: true,
    values: [
      { id: 23, label: "მამრობითი",  order: 1, active: true },
      { id: 24, label: "მდედრობითი", order: 2, active: true },
      { id: 25, label: "უნისექსი",   order: 3, active: true },
    ],
  },
  {
    id: 15, name: "მხის დამჭერი ფაქტურა", type: "text", isGlobal: false, order: 10,
    filterType: "multi_select", active: true,
    values: [
      { id: 26, label: "ბამბა",   order: 1, active: true  },
      { id: 27, label: "ბოჭკო",   order: 2, active: true  },
      { id: 28, label: "ნეილონი", order: 3, active: false },
    ],
  },
];

// ─── Shared styles ─────────────────────────────────────────────────────────────

// ─── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);


const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);


// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none flex-shrink-0 ${on ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ value }: { value: string }) {
  return (
    <code className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">
      {value}
    </code>
  );
}


// ─── Filter values modal ────────────────────────────────────────────────────────

interface FilterValuesModalProps {
  filter: AttributeFilter;
  onClose: () => void;
  onUpdate: (values: FilterValue[]) => void;
}

function FilterValuesModal({ filter, onClose, onUpdate }: FilterValuesModalProps) {
  const [values, setValues] = useState<FilterValue[]>(
    [...filter.values].sort((a, b) => a.order - b.order)
  );

  const toggleValue = (id: number) => {
    const next = values.map(v => v.id === id ? { ...v, active: !v.active } : v);
    setValues(next);
    onUpdate(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">ფილტრის მნიშვნელობები</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filter.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Values list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 min-h-0">
          {values.length === 0 && (
            <p className="px-6 py-8 text-sm text-center text-gray-400">მნიშვნელობები არ არის</p>
          )}
          {values.map(v => (
            <div key={v.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-6 text-xs text-gray-400 font-mono text-center flex-shrink-0">{v.order}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-800 dark:text-white/90">{v.label}</span>
              </div>
              <Toggle on={v.active} onToggle={() => toggleValue(v.id)} />
            </div>
          ))}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            დახურვა
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AttributeFiltersPage() {
  const [filters, setFilters] = useState<AttributeFilter[]>(INITIAL);
  const [search, setSearch]   = useState("");

  const [valuesFilter, setValuesFilter] = useState<AttributeFilter | null>(null);

  const displayed = useMemo(() => {
    const sorted = [...filters].sort((a, b) => a.order - b.order);
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(f => f.name.toLowerCase().includes(q));
  }, [filters, search]);

  const toggleActive = (id: number) =>
    setFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));

  const updateValues = (filterId: number, values: FilterValue[]) =>
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, values } : f));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">ატრიბუტები / ფილტრები</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ფილტრების მართვა</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ფილტრების სია</span>
          <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
            {displayed.length}
          </span>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
            <input
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-9 pr-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ფილტრის დასახელება..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left border-b border-gray-100 dark:border-gray-800">
              <tr>
                {["ID","დასახელება","ტიპი","არის ზოგადი ფილტრი","მიმდევრობა","ფილტრის ტიპი","სტატუსი",""].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {displayed.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 font-mono text-xs">{f.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-800 dark:text-white/90">{f.name}</span>
                    {f.values.length > 0 && (
                      <span className="ml-2 text-xs text-gray-400">({f.values.length} მნიშვნელობა)</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`font-mono text-xs font-medium ${DATA_TYPE_CLS[f.type]}`}>{f.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-medium ${f.isGlobal ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                      {f.isGlobal ? "დიახ" : "არა"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="w-6 text-sm font-mono text-gray-700 dark:text-gray-300 text-center">{f.order}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <TypeBadge value={f.filterType} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Toggle on={f.active} onToggle={() => toggleActive(f.id)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      {(f.type === "clickable" || f.type === "color" || f.type === "text") && (
                        <button
                          onClick={() => setValuesFilter(f)}
                          className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                          title="მნიშვნელობები"
                        >
                          <ListIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    ფილტრები არ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter values modal */}
      {valuesFilter && (
        <FilterValuesModal
          filter={valuesFilter}
          onClose={() => setValuesFilter(null)}
          onUpdate={values => updateValues(valuesFilter.id, values)}
        />
      )}
    </div>
  );
}
