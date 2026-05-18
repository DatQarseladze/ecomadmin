import { useMemo, useRef, useState } from "react";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface EventItem {
  id: number;
  code: string;
  title: string;
  description: string;
  photoFile: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
  date: string;
  time: string;
  price: number;
  points: number;
}

type FilterTab = "all" | "future" | "past";

const CITIES = [
  "თბილისი",
  "ქუთაისი",
  "ბათუმი",
  "გორი",
  "რუსთავი",
  "ზუგდიდი",
  "სამტრედია",
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    code: "EV-001",
    title: "საერთაშორისო მუსიკის ფესტივალი",
    description: "საერთაშორისო მუსიკის ფესტივალი თბილისის ცენტრში.",
    photoFile: "",
    city: "თბილისი",
    address: "რუსთაველის გამზ. 1, თბილისი",
    lat: "41.6938",
    lng: "44.8015",
    date: "2025-07-15",
    time: "19:00",
    price: 25,
    points: 500,
  },
  {
    id: 2,
    code: "EV-002",
    title: "საერთაშორისო მუსიკის ფესტივალი",
    description: "საერთაშორისო მუსიკის ფესტივალი თბილისის ცენტრში.",
    photoFile: "",
    city: "თბილისი",
    address: "რუსთაველის გამზ. 1, თბილისი",
    lat: "41.6938",
    lng: "44.8015",
    date: "2025-07-15",
    time: "19:00",
    price: 25,
    points: 500,
  },
  {
    id: 3,
    code: "EV-003",
    title: "ღამის კონცერტი",
    description: "ღამის კონცერტი ცენტრალურ მოედანზე.",
    photoFile: "",
    city: "ბათუმი",
    address: "ნინოშვილის ქ. 5, ბათუმი",
    lat: "41.6473",
    lng: "41.6320",
    date: "2026-09-20",
    time: "21:00",
    price: 40,
    points: 800,
  },
];

let nextId = 100;

const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const sectionHeadCls =
  "text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3";

const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ImageIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const MapIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function isPastEvent(date: string) {
  return date < todayISO();
}

function getEventStatus(date: string): "past" | "future" {
  return isPastEvent(date) ? "past" : "future";
}

interface EventFormProps {
  editing: EventItem | null;
  onSave: (data: Omit<EventItem, "id" | "code">, id?: number) => void;
  onCancel: () => void;
}

function EventForm({ editing, onSave, onCancel }: EventFormProps) {
  const e = editing;
  const [title, setTitle] = useState(e?.title ?? "");
  const [description, setDescription] = useState(e?.description ?? "");
  const [photoFile, setPhotoFile] = useState(e?.photoFile ?? "");
  const [city, setCity] = useState(e?.city ?? "თბილისი");
  const [address, setAddress] = useState(e?.address ?? "");
  const [lat, setLat] = useState(e?.lat ?? "41.6938");
  const [lng, setLng] = useState(e?.lng ?? "44.8015");
  const [date, setDate] = useState(e?.date ?? "");
  const [time, setTime] = useState(e?.time ?? "");
  const [price, setPrice] = useState<number | "">(e?.price ?? "");
  const [points, setPoints] = useState<number | "">(e?.points ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => setPhotoFile(file.name);

  const canSave =
    title.trim() && city.trim() && address.trim() && date && price !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        photoFile,
        city,
        address: address.trim(),
        lat,
        lng,
        date,
        time,
        price: Number(price),
        points: Number(points) || 0,
      },
      e?.id
    );
  };

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {editing ? "ივენთის რედაქტირება" : "ახალი ივენთი"}
        </h3>
      </div>

      {/* Body */}
      <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
        {/* Photo */}
        <div>
          <p className={sectionHeadCls}>ფოტო</p>
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={(ev) => {
              ev.preventDefault();
              const f = ev.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onDragOver={(ev) => ev.preventDefault()}
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center gap-1.5 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <ImageIcon />
            <p className="text-xs text-center">
              <span className="text-blue-500 font-medium">
                ფოტოს ასატვირთად დააჭირეთ
              </span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG — მაქს. 5 MB</p>
          </div>
          {photoFile && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
              <CheckIcon />
              <span className="text-sm text-green-700 dark:text-green-400 flex-1 truncate">
                {photoFile}
              </span>
              <button
                onClick={() => setPhotoFile("")}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              if (f) handleFile(f);
              ev.target.value = "";
            }}
          />
        </div>

        {/* Title */}
        <div>
          <p className={sectionHeadCls}>ძირითადი</p>
          <div>
            <label className={labelCls}>
              სათაური <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="ივენთის სათაური"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <p className={sectionHeadCls}>ადგილმდებარეობა</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                ქალაქი <span className="text-red-500">*</span>
              </label>
              <select
                className={inputCls + " cursor-pointer"}
                value={city}
                onChange={(ev) => setCity(ev.target.value)}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                მისამართი <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="მაგ: რუსთაველის გამზ. 1, თბილისი"
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
              />
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className={labelCls}>გრძედი (Lat)</label>
                <input
                  className={inputCls}
                  placeholder="41.6938"
                  value={lat}
                  onChange={(ev) => setLat(ev.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>განედი (Lng)</label>
                <input
                  className={inputCls}
                  placeholder="44.8015"
                  value={lng}
                  onChange={(ev) => setLng(ev.target.value)}
                />
              </div>
              <button
                type="button"
                title="რუკაზე ნახვა"
                onClick={() => {
                  if (lat && lng) {
                    window.open(
                      `https://www.google.com/maps?q=${lat},${lng}`,
                      "_blank"
                    );
                  }
                }}
                className="h-[42px] w-[42px] flex items-center justify-center rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <MapIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Date / Time */}
        <div>
          <p className={sectionHeadCls}>დრო</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                თარიღი <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(ev) => setDate(ev.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">
                ფორმატი: {formatDateDisplay(date) || "DD-MM-YYYY"}
              </p>
            </div>
            <div>
              <label className={labelCls}>დრო</label>
              <div className="relative">
                <input
                  type="time"
                  className={inputCls + " pr-9"}
                  value={time}
                  onChange={(ev) => setTime(ev.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ClockIcon />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <p className={sectionHeadCls}>ღირებულება</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ლარი (₾)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₾
                </span>
                <input
                  type="number"
                  min={0}
                  className={inputCls + " pl-7"}
                  placeholder="0"
                  value={price}
                  onChange={(ev) =>
                    setPrice(ev.target.value === "" ? "" : Number(ev.target.value))
                  }
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>ქულა (★)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 text-sm">
                  ★
                </span>
                <input
                  type="number"
                  min={0}
                  className={inputCls + " pl-7"}
                  placeholder="0"
                  value={points}
                  onChange={(ev) =>
                    setPoints(
                      ev.target.value === "" ? "" : Number(ev.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className={sectionHeadCls}>აღწერა</p>
          <div>
            <label className={labelCls}>მოკლე აღწერა</label>
            <textarea
              rows={3}
              className={inputCls}
              placeholder="ივენთის მოკლე აღწერა..."
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          გაუქმება
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <CheckIcon />
          შენახვა
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  const total = events.length;

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const status = getEventStatus(ev.date);
      if (tab === "future" && status !== "future") return false;
      if (tab === "past" && status !== "past") return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.address.toLowerCase().includes(q) ||
          ev.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, tab, search]);

  const handleOpenAdd = () => {
    setEditing(null);
    openModal();
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditing(ev);
    openModal();
  };

  const handleSave = (data: Omit<EventItem, "id" | "code">, id?: number) => {
    if (id !== undefined) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, ...data } : ev))
      );
    } else {
      const newId = nextId++;
      const code = `EV-${String(newId).padStart(3, "0")}`;
      setEvents((prev) => [...prev, { id: newId, code, ...data }]);
    }
    closeModal();
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ ივენთის წაშლა?")) return;
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const tabBtn = (key: FilterTab, label: string) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
        tab === key
          ? "bg-white border-blue-500 text-blue-600 dark:bg-gray-900 dark:text-blue-400"
          : "bg-transparent border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            ივენთები
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ივენთების მართვა და კონფიგურაცია
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon />
          ახალი ივენთი
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
              ივენთების სია
            </h2>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800">
            {tabBtn("all", "ყველა")}
            {tabBtn("future", "მომავალი")}
            {tabBtn("past", "წარსული")}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-10 pr-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="სათაური ან მისამართი..."
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {[
                  "ფოტო",
                  "სათაური",
                  "მისამართი",
                  "თარიღი",
                  "ღირ. ₾",
                  "ღირ. ★",
                  "ქალაქი",
                  "სტატუსი",
                  "",
                ].map((h, idx) => (
                  <TableCell
                    key={idx}
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-left whitespace-nowrap"
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filtered.map((ev) => {
                const status = getEventStatus(ev.date);
                return (
                  <TableRow
                    key={ev.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <ImageIcon />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate max-w-[220px]">
                        {ev.title}
                      </p>
                      <p className="text-xs text-gray-400">{ev.code}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[220px]">
                        {ev.address}
                      </p>
                      <button
                        onClick={() => {
                          if (ev.lat && ev.lng) {
                            window.open(
                              `https://www.google.com/maps?q=${ev.lat},${ev.lng}`,
                              "_blank"
                            );
                          }
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                      >
                        <MapIcon /> რუკა
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatDateDisplay(ev.date)}
                      </p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {ev.time}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      ₾{ev.price}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {ev.points}{" "}
                      <span className="text-yellow-500">★</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {ev.city}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          status === "past"
                            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === "past" ? "bg-gray-400" : "bg-green-500"
                          }`}
                        />
                        {status === "past" ? "წარსული" : "მომავალი"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          title="რედაქტირება"
                          className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          title="წაშლა"
                          className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    isHeader={false}
                    className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    ივენთები არ მოიძებნა
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setEditing(null);
        }}
        className="max-w-[560px] m-4"
      >
        <EventForm
          editing={editing}
          onSave={handleSave}
          onCancel={() => {
            closeModal();
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
