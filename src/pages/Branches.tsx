import { useMemo, useRef, useState } from "react";
import Pagination from "../components/common/Pagination";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Branch {
  id: number;
  abiId: string;
  name: string;
  photoFile: string;
  region: string;
  district: string;
  address: string;
  workFrom: string;
  workTo: string;
  phone: string;
  lat: string;
  lng: string;
  status: "active" | "inactive";
}

type View = "list" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

const GEO_REGIONS: Record<string, string[]> = {
  "თბილისი":   ["ვაკე", "საბურთალო", "ისანი", "სამგორი", "გლდანი", "ნაძალადევი", "ჩუღურეთი", "კრწანისი", "მთაწმინდა"],
  "ქუთაისი":   ["ცენტრი", "ბლოკი", "ნიქეა", "გელათი"],
  "ბათუმი":    ["ცენტრი", "ლაქობი", "ახალშაბათი", "ბაგი"],
  "გორი":      ["ძველი გორი", "ახალი გორი"],
  "რუსთავი":   ["გამარჯვება", "ინდუსტრიული"],
  "ზუგდიდი":   ["ცენტრი", "ლელიანი"],
  "სამტრედია": ["ცენტრი"],
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
];

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let nextId = 13;

function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return w.length >= 2 ? w[0][0] + w[1][0] : name.slice(0, 2);
}

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function fmt24(t: string) {
  return t; // stored as HH:MM 24h
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL: Branch[] = [
  { id: 1, abiId: "ABI-1001", name: "ვაკე",      photoFile: "", region: "თბილისი",   district: "ვაკე",        address: "ბრავი, მთავარი",            workFrom: "09:00", workTo: "21:00", phone: "032 2 00 10 10", lat: "41.7225", lng: "44.7659", status: "active"   },
  { id: 2, abiId: "ABI-1002", name: "საბართულო",      photoFile: "", region: "ზუგდიდი",    district: "ცენტრი",      address: "ზვიადის გამზ. 3",            workFrom: "09:00", workTo: "19:00", phone: "0415 22 33 44",  lat: "42.5080", lng: "41.8710", status: "inactive" },
  { id: 3, abiId: "ABI-1003", name: "ბათუმი",           photoFile: "", region: "სამტრედია",  district: "ცენტრი",      address: "ეგნატე ნინოს ქ. 6",          workFrom: "09:00", workTo: "18:00", phone: "0431 22 33 44",  lat: "42.1530", lng: "42.3390", status: "active"   },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);


const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const sectionHeadCls = "text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3";

// ─── Form ─────────────────────────────────────────────────────────────────────

function BranchForm({
  editing, branches,
  //  onSave, onCancel,
}: {
  editing: Branch | null;
  branches: Branch[];
  onSave: (data: Omit<Branch, "id">, id?: number) => void;
  onCancel: () => void;
}) {
  const b = editing;
  const [abiId,     setAbiId]     = useState(b?.abiId     ?? "");
  const [name,      setName]      = useState(b?.name       ?? "");
  const [photoFile, setPhotoFile] = useState(b?.photoFile  ?? "");
  const [region,    setRegion]    = useState(b?.region     ?? "");
  const [district,  setDistrict]  = useState(b?.district   ?? "");
  const [address,   setAddress]   = useState(b?.address    ?? "");
  const [workFrom,  setWorkFrom]  = useState(b?.workFrom   ?? "09:00");
  const [workTo,    setWorkTo]    = useState(b?.workTo     ?? "18:00");
  const [phone,     setPhone]     = useState(b?.phone      ?? "");
  const [lat,       setLat]       = useState(b?.lat        ?? "");
  const [lng,       setLng]       = useState(b?.lng        ?? "");
  const [status,    setStatus]    = useState<Branch["status"]>(b?.status ?? "active");
  const [sideSearch, setSideSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const districts = region ? (GEO_REGIONS[region] ?? []) : [];

  const handleRegionChange = (r: string) => {
    setRegion(r);
    setDistrict("");
  };

  const handleFile = (file: File) => setPhotoFile(file.name);

  // const canSave = name.trim() && address.trim() && workFrom && workTo;

  // const handleSave = () => {
  //   if (!canSave) return;
  //   onSave({ abiId, name, photoFile, region, district, address, workFrom, workTo, phone, lat, lng, status }, b?.id);
  // };

  const filteredSide = branches.filter(br =>
    br.name.toLowerCase().includes(sideSearch.toLowerCase()) ||
    br.address.toLowerCase().includes(sideSearch.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* ── Main form ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Identifiers */}
        <div>
          <p className={sectionHeadCls}>იდენტიფიკატორები</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ID (არ იცვლება)</label>
              <div className="relative">
                <input className={inputCls} disabled value={b ? `#${String(b.id).padStart(3, "0")}` : "– –"} />
              </div>
            </div>
            <div>
              <label className={labelCls}>ABI ID</label>
              <input className={inputCls} placeholder="მაგ: ABI-0042" value={abiId} onChange={e => setAbiId(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div>
          <p className={sectionHeadCls}>ძირითადი</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>დასახელება <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="ფილიალის სახელი" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>ფოტო</label>
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center gap-1.5 cursor-pointer hover:border-blue-400 transition-colors"
              >
                <UploadIcon />
                <p className="text-xs text-center">
                  <span className="text-blue-500 font-medium">ფოტოს ასატვირთად დაჭირეთ</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG — მაქს. 5 MB</p>
              </div>
              {photoFile && (
                <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-500 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-sm text-green-700 dark:text-green-400 flex-1 truncate">{photoFile}</span>
                  <button onClick={() => setPhotoFile("")} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <p className={sectionHeadCls}>ადგილმდებარეობა</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>თბილისი / რეგიონი <span className="text-red-500">*</span></label>
                <select className={inputCls} value={region} onChange={e => handleRegionChange(e.target.value)}>
                  <option value="">— აირჩიეთ —</option>
                  {Object.keys(GEO_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>ქალაქი / რაიონი <span className="text-red-500">*</span></label>
                <select className={inputCls} value={district} onChange={e => setDistrict(e.target.value)} disabled={!region}>
                  <option value="">{region ? "— აირჩიეთ —" : "— ეერ რეგიონი —"}</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>ქუჩა / მისამართი <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="მაგ: რუსთაველის გამზ. 12" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Contact & hours */}
        <div>
          <p className={sectionHeadCls}>კონტაქტი & საათები</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>სამუშაო საათები <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <input type="time" className={inputCls} value={workFrom} onChange={e => setWorkFrom(e.target.value)} />
                <span className="text-gray-400 flex-shrink-0">—</span>
                <input type="time" className={inputCls} value={workTo} onChange={e => setWorkTo(e.target.value)} />
              </div>
              {workFrom && workTo && (
                <p className="mt-1 text-xs text-gray-400">{fmt24(workFrom)} — {fmt24(workTo)}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>ტელეფონი</label>
              <input className={inputCls} placeholder="+995 555 00 00 00" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <p className={sectionHeadCls}>კოორდინატები</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>გრძედი (Lat)</label>
              <input className={inputCls} placeholder="41.6941" value={lat} onChange={e => setLat(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>განედი (Lng)</label>
              <div className="relative">
                <input className={`${inputCls} pr-9`} placeholder="44.8337" value={lng} onChange={e => setLng(e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><MapPinIcon /></span>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">კოორდინატების შევსებისთვის გამოიყენეთ Google Maps ბმული</p>
        </div>

        {/* Status */}
        <div>
          <p className={sectionHeadCls}>სტატუსი</p>
          <div className="flex gap-3">
            {(["active", "inactive"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  status === s
                    ? s === "active"
                      ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === s ? (s === "active" ? "bg-green-500" : "bg-red-500") : "bg-gray-300"}`} />
                {s === "active" ? "აქტიური" : "გათიშული"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Branch list sidebar ───────────────────────── */}
      <div className="w-72 flex-shrink-0 border-l border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">ფილიალის სია</span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">{branches.length}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></span>
            <input
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-9 pr-3 py-2 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="საძიებო სიტყვა..."
              value={sideSearch}
              onChange={e => setSideSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
          {filteredSide.map(br => (
            <div key={br.id} className="flex items-start justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-white/90 truncate">{br.name}</p>
                <p className="text-xs text-gray-400 truncate">{br.district}</p>
                <p className="text-xs text-gray-400 truncate">{br.address}</p>
                <p className="text-xs text-blue-500 mt-0.5">{fmt24(br.workFrom)} — {fmt24(br.workTo)}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{br.abiId.replace("ABI-", "BR-")}</span>
            </div>
          ))}
          {filteredSide.length === 0 && (
            <p className="p-4 text-xs text-gray-400 text-center">არ მოიძებნა</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL);
  const [view, setView]         = useState<View>("list");
  const [editing, setEditing]   = useState<Branch | null>(null);
  const [search, setSearch]     = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage]         = useState(1);

  // ── Stats ──
  const total    = branches.length;
  const active   = branches.filter(b => b.status === "active").length;
  const inactive = branches.filter(b => b.status === "inactive").length;

  // ── Filtered + paginated ──
  const filtered = useMemo(() => {
    return branches.filter(b => {
      const q = search.toLowerCase();
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.abiId.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
      const matchRegion = !filterRegion || b.region === filterRegion;
      const matchStatus = !filterStatus || b.status === filterStatus;
      return matchSearch && matchRegion && matchStatus;
    });
  }, [branches, search, filterRegion, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // ── CRUD ──
  const openAdd  = () => { setEditing(null); setView("form"); };
  const openEdit = (b: Branch) => { setEditing(b); setView("form"); };
  const closeForm = () => { setView("list"); setEditing(null); };

  const saveBranch = (data: Omit<Branch, "id">, id?: number) => {
    if (id !== undefined) {
      setBranches(prev => prev.map(b => b.id === id ? { id, ...data } : b));
    } else {
      setBranches(prev => [...prev, { id: nextId++, ...data }]);
    }
    closeForm();
  };

  const toggleStatus = (id: number) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b));
  };

  // ── Form view ──────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Form header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <h1 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {editing ? "ფილიალის რედაქტირება" : "ახალი ფილიალი"}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={closeForm} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
            <button
              onClick={() => {
                const form = document.getElementById("branch-form-save");
                form?.click();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              შენახვა
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
          <BranchForm
            editing={editing}
            branches={branches}
            onSave={saveBranch}
            onCancel={closeForm}
          />
        </div>

        {/* Hidden save trigger */}
        <button id="branch-form-save" className="hidden" />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">ფილიალების მართვა</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">სულ {total} ფილიალი</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "სულ ფილიალი", value: total, sub: "ყველა სტატუსი", dot: "bg-gray-400", valCls: "text-gray-800 dark:text-white/90" },
          { label: "აქტიური",     value: active, sub: "მუშაობს",       dot: "bg-green-500", valCls: "text-green-600 dark:text-green-400" },
          { label: "გათიშული",    value: inactive, sub: "არამუშა",      dot: "bg-red-500",   valCls: "text-red-600 dark:text-red-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-6 py-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.valCls}`}>{s.value}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-xs text-gray-400">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></span>
          <input
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-9 pr-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="მოძებნე დასახელება, ABI ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
        </div>
        <select
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterRegion}
          onChange={e => { setFilterRegion(e.target.value); resetPage(); }}
        >
          <option value="">ყველა რეგიონი</option>
          {Object.keys(GEO_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); resetPage(); }}
        >
          <option value="">ყველა სტატუსი</option>
          <option value="active">აქტიური</option>
          <option value="inactive">გათიშული</option>
        </select>
        <button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          ფილიალის დამატება
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {["ID", "ფოტო", "დასახელება", "ABI ID", "რეგიონი", "რაიონი", "სამ. დრო", "ტელეფონი", "სტატუსი", "მოქმედება"].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {pageItems.map(b => (
                <TableRow key={b.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    #{String(b.id).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(b.id)}`}>
                      {initials(b.name).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">{b.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{b.address}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{b.abiId}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{b.region}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{b.district}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap font-mono">{b.workFrom}–{b.workTo}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap font-medium">{b.phone}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge size="sm" color={b.status === "active" ? "success" : "error"}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${b.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                      {b.status === "active" ? "აქტიური" : "გათიშული"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleStatus(b.id)}
                        title={b.status === "active" ? "გათიშვა" : "გააქტიურება"}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          b.status === "active"
                            ? "border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "border-green-200 dark:border-green-900/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                      >
                        {b.status === "active" ? "გათიშვა" : "გააქტ."}
                      </button>
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                        <EditIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500" isHeader={false}>
                    ფილიალები არ მოიძებნა
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="ჩანაწერი"
      />

    </div>
  );
}
