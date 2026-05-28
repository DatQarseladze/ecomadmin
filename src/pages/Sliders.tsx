import { useState, useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import ComponentCard from "../components/common/ComponentCard";

// ─── Flatpickr date input ─────────────────────────────────────────────────────

interface FlatpickrInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

function FlatpickrInput({ value, onChange, placeholder = "თარიღის არჩევა", minDate, maxDate, className }: FlatpickrInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef    = useRef<flatpickr.Instance | null>(null);

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
    return () => {
      fpRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep external value in sync (e.g. when form resets)
  useEffect(() => {
    if (fpRef.current) {
      fpRef.current.setDate(value || "", false);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        readOnly
        placeholder={placeholder}
        className={className}
        defaultValue={value}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <CalendarIcon />
      </span>
    </div>
  );
}

// ─── Flatpickr time input ─────────────────────────────────────────────────────

interface FlatpickrTimeInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

function FlatpickrTimeInput({ value, onChange, placeholder = "დროის არჩევა", className }: FlatpickrTimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef    = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      minuteIncrement: 5,
      onChange: ([date]) => {
        if (date) {
          const h = String(date.getHours()).padStart(2, "0");
          const m = String(date.getMinutes()).padStart(2, "0");
          onChange(`${h}:${m}`);
        }
      },
    }) as flatpickr.Instance;
    return () => {
      fpRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fpRef.current) {
      fpRef.current.setDate(value || "", false);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        readOnly
        placeholder={placeholder}
        className={className}
        defaultValue={value}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <ClockIcon />
      </span>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SliderItem {
  id: number;
  name: string;
  type: string;
  slides: number;
  active: boolean;
}

interface BannerItem {
  id: number;
  name: string;
  sliderId: number | null;
  order: number;
  description: string;
  contextUrl: string;
  validFrom: string;
  validFromTime: string;
  validTo: string;
  validToTime: string;
  active: boolean;
  imageFile: File | null;
  imageName: string;
}

type SliderFormMode = "create" | "edit" | null;
type BannerFormMode = "create" | "edit" | null;
type ActiveTab = "sliders" | "banners";

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialSliders: SliderItem[] = [
  { id: 1, name: "მთავარი სლაიდერი", type: "Main Slider", slides: 4, active: true },
  { id: 2, name: "პრომო სლაიდერი",   type: "Promo Slider", slides: 2, active: false },
];

const defaultBanner = (): Omit<BannerItem, "id"> => ({
  name: "",
  sliderId: null,
  order: 1,
  description: "",
  contextUrl: "",
  validFrom: "",
  validFromTime: "",
  validTo: "",
  validToTime: "",
  active: true,
  imageFile: null,
  imageName: "",
});

const initialBanners: BannerItem[] = [
  { id: 1, name: "Summer Sale Banner",  sliderId: 1, order: 1, description: "", contextUrl: "", validFrom: "", validFromTime: "", validTo: "", validToTime: "", active: true,  imageFile: null, imageName: "" },
  { id: 2, name: "New Arrivals Promo",  sliderId: 2, order: 2, description: "", contextUrl: "", validFrom: "", validFromTime: "", validTo: "", validToTime: "", active: false, imageFile: null, imageName: "" },
];

const sliderTypes  = ["Main Slider", "Promo Slider", "Category Slider"];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const ImageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 p-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const selectCls = inputCls + " cursor-pointer";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const sectionTitleCls = "text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 mt-1";
const dividerCls = "border-t border-gray-100 dark:border-gray-800 my-5";

// ─── SLIDER section ───────────────────────────────────────────────────────────

interface SliderTableProps {
  sliders: SliderItem[];
  editingId: number | null;
  onEdit: (s: SliderItem) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

function SliderTable({ sliders, editingId, onEdit, onDelete, onToggleActive }: SliderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-left">
          <tr>
            {["სახელი","ტიპი","სლაიდები","სტატუსი","მოქმედება"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sliders.map((s) => (
            <tr key={s.id} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${editingId === s.id ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{s.name}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">{s.type}</span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.slides}</td>
              <td className="px-4 py-3">
                <button onClick={() => onToggleActive(s.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${s.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.active ? "bg-green-500" : "bg-gray-400"}`} />
                  {s.active ? "აქტიური" : "არააქტიური"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(s)} title="რედაქტირება" className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><EditIcon /></button>
                  <button onClick={() => onDelete(s.id)} title="წაშლა" className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><TrashIcon /></button>
                </div>
              </td>
            </tr>
          ))}
          {sliders.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">სლაიდერები არ მოიძებნა</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface SliderFormProps {
  formMode: SliderFormMode;
  form: { name: string; type: string };
  onChange: (f: { name: string; type: string }) => void;
  onSave: () => void;
  onClose: () => void;
}

function SliderFormPanel({ formMode, form, onChange, onSave, onClose }: SliderFormProps) {
  const cardTitle = formMode === "edit" ? "სლაიდერის რედაქტირება" : "ახალი სლაიდერი";
  return (
    <ComponentCard title={cardTitle}>
      <div className="space-y-5">
        <div className="flex justify-between items-center -mt-2">
          <p className={sectionTitleCls}>ძირითადი ინფორმაცია</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><CloseIcon /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slider Name <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="მაგ: მთავარი სლაიდერი" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Slider Type <span className="text-red-500">*</span></label>
            <select className={selectCls} value={form.type} onChange={(e) => onChange({ ...form, type: e.target.value })}>
              <option value="">ტიპის არჩევა</option>
              {sliderTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className={sectionTitleCls}>სურათების ატვირთვა</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Desktop სურათი', 'Mobile სურათი'].map((lbl) => (
              <div key={lbl}>
                <label className={labelCls}>{lbl}</label>
                <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={sectionTitleCls}>დალინკვა</p>
          <select className={selectCls}>
            <option value="">ენთითის ტიპი</option>
            <option value="category">კატეგორია</option>
            <option value="product">პროდუქტი</option>
            <option value="brand">ბრენდი</option>
            <option value="tag">ტეგი</option>
            <option value="internal">შიდა გვერდი</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
          <button onClick={onSave} disabled={!form.name.trim() || !form.type}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            <CheckIcon />
            {formMode === "edit" ? "განახლება" : "შენახვა"}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}

// ─── BANNER section ───────────────────────────────────────────────────────────

interface BannerFormPanelProps {
  formMode: BannerFormMode;
  form: Omit<BannerItem, "id">;
  sliders: SliderItem[];
  onChange: (f: Omit<BannerItem, "id">) => void;
  onSave: () => void;
  onClose: () => void;
}

function BannerFormPanel({ formMode, form, sliders, onChange, onSave, onClose }: BannerFormPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange({ ...form, imageFile: file, imageName: file?.name ?? "" });
  };

  const removeFile = () => {
    onChange({ ...form, imageFile: null, imageName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cardTitle = formMode === "edit" ? "ბანერის რედაქტირება" : "ბანერის შექმნა / რედაქტირება";

  return (
    <ComponentCard title={cardTitle}>
      <div className="space-y-5">
        {/* Close row */}
        <div className="flex justify-end -mt-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><CloseIcon /></button>
        </div>

        {/* ── ფოტო ── */}
        <p className={sectionTitleCls}>ფოტო</p>
        <div>
          <label className={labelCls}>ფოტოს ატვირთვა <span className="text-red-500">*</span></label>

          {/* Drop zone */}
          {!form.imageName && (
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-7 text-center cursor-pointer bg-gray-50 dark:bg-gray-800/30 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
              <input ref={fileInputRef} type="file" accept="image/*" className="absolute inset-0 w-full opacity-0 cursor-pointer" onChange={handleFileChange} />
              <div className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <UploadIcon />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">ფოტოს ასატვირთად დააჭირეთ</span> ან ჩამოაგდეთ
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — მაქს. 5 MB</p>
            </label>
          )}

          {/* Preview */}
          {form.imageName && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mt-1">
              <span className="text-green-600 dark:text-green-400 flex-shrink-0"><ImageIcon /></span>
              <span className="text-sm text-green-700 dark:text-green-400 font-medium flex-1 truncate">{form.imageName}</span>
              <button onClick={removeFile} className="text-green-600 dark:text-green-400 hover:text-green-800 transition-colors"><CloseIcon /></button>
            </div>
          )}
        </div>

        <div className={dividerCls} />

        {/* ── კონტენტი ── */}
        <p className={sectionTitleCls}>კონტენტი</p>

        <div>
          <label className={labelCls}>კონტექსტი</label>
          <textarea
            className={`${inputCls} resize-none min-h-[80px]`}
            placeholder="ბანერის აღწერა ან კონტექსტი..."
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className={labelCls}>Context URL</label>
          <div className="relative">
            <input
              type="url"
              className={`${inputCls} pr-9`}
              placeholder="https://example.com/page"
              value={form.contextUrl}
              onChange={(e) => onChange({ ...form, contextUrl: e.target.value })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><LinkIcon /></span>
          </div>
        </div>

        <div className={dividerCls} />

        {/* ── ვალიდობის პერიოდი ── */}
        <p className={sectionTitleCls}>ვალიდობის პერიოდი</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Valid From */}
          <div>
            <label className={labelCls}>Valid From</label>
            <FlatpickrInput
              value={form.validFrom}
              onChange={(val) => onChange({ ...form, validFrom: val })}
              maxDate={form.validTo || undefined}
              className={`${inputCls} pr-9 mb-2`}
            />
            <FlatpickrTimeInput
              value={form.validFromTime}
              onChange={(val) => onChange({ ...form, validFromTime: val })}
              className={`${inputCls} pr-9`}
            />
          </div>
          {/* Valid To */}
          <div>
            <label className={labelCls}>Valid To</label>
            <FlatpickrInput
              value={form.validTo}
              onChange={(val) => onChange({ ...form, validTo: val })}
              minDate={form.validFrom || undefined}
              className={`${inputCls} pr-9 mb-2`}
            />
            <FlatpickrTimeInput
              value={form.validToTime}
              onChange={(val) => onChange({ ...form, validToTime: val })}
              className={`${inputCls} pr-9`}
            />
          </div>
        </div>

        <div className={dividerCls} />

        {/* ── კონფიგურაცია ── */}
        <p className={sectionTitleCls}>კონფიგურაცია</p>

        <div>
          <label className={labelCls}>სლაიდერის მიბმა <span className="text-red-500">*</span></label>
          <select
            className={selectCls}
            value={form.sliderId ?? ""}
            onChange={(e) => onChange({ ...form, sliderId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">სლაიდერის არჩევა</option>
            {sliders.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.type}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-gray-400">Slider ID მიებმება ბანერს</p>
        </div>

        {/* Banner Order */}
        <div>
          <label className={labelCls}>Banner Order</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-32">
              <button
                onClick={() => onChange({ ...form, order: Math.max(1, form.order - 1) })}
                className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg font-light transition-colors flex-shrink-0"
              >−</button>
              <input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => onChange({ ...form, order: Math.max(1, Number(e.target.value)) })}
                className="w-full text-center text-sm font-medium font-mono border-none outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 h-10 p-0"
              />
              <button
                onClick={() => onChange({ ...form, order: form.order + 1 })}
                className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg font-light transition-colors flex-shrink-0"
              >+</button>
            </div>
            <span className="text-xs text-gray-400">ბანერის თანმიმდევრობა სლაიდერში</span>
          </div>
        </div>

        <div className={dividerCls} />

        {/* Is Active toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">Is Active</p>
            <p className="text-xs text-gray-400 mt-0.5">ბანერი გამოჩნდება საიტზე</p>
          </div>
          <button
            onClick={() => onChange({ ...form, active: !form.active })}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
          <button
            onClick={onSave}
            disabled={!form.name.trim() || form.sliderId === null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CheckIcon />
            {formMode === "edit" ? "განახლება" : "შენახვა"}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}

// Banner list card (right column)
interface BannerListCardProps {
  banners: BannerItem[];
  sliders: SliderItem[];
  editingId: number | null;
  onEdit: (b: BannerItem) => void;
  onDelete: (id: number) => void;
}

const THUMB_GRADIENTS = [
  "from-blue-100 to-blue-200",
  "from-green-100 to-green-200",
  "from-purple-100 to-purple-200",
  "from-orange-100 to-orange-200",
  "from-pink-100 to-pink-200",
];

function BannerListCard({ banners, sliders, editingId, onEdit, onDelete }: BannerListCardProps) {
  const sliderName = (id: number | null) => sliders.find((s) => s.id === id)?.name ?? "—";

  return (
    <ComponentCard title="ბანერების სია">
      {banners.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">ბანერები არ მოიძებნა</p>
      )}
      <div className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 border-t border-gray-100 dark:border-gray-800 transition-colors ${editingId === b.id ? "bg-blue-50 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}`}
          >
            {/* Thumbnail placeholder */}
            <div className={`w-14 h-9 rounded-md bg-gradient-to-br ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]} border border-gray-200 dark:border-gray-700 flex-shrink-0`} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{b.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">ორდ. #{b.order} · {sliderName(b.sliderId)}</p>
            </div>

            <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${b.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
              {b.active ? "აქტიური" : "გათიშული"}
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => onEdit(b)} title="რედაქტირება" className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><EditIcon /></button>
              <button onClick={() => onDelete(b.id)} title="წაშლა" className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><TrashIcon /></button>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}

// Stats card
function StatsCard({ sliders, banners }: { sliders: SliderItem[]; banners: BannerItem[] }) {
  const activeCount = banners.filter((b) => b.active).length;
  return (
    <ComponentCard title="სტატისტიკა">
      <div className="space-y-3 -mt-2">
        {[
          { label: "სულ სლაიდერი",  value: sliders.length,  color: "" },
          { label: "სულ ბანერი",    value: banners.length,  color: "" },
          { label: "აქტიური ბანერი", value: activeCount,    color: "text-green-600 dark:text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`text-sm font-semibold font-mono ${color || "text-gray-800 dark:text-white/90"}`}>{value}</span>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlidersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("sliders");

  // ── Slider state ──
  const [sliders, setSliders] = useState<SliderItem[]>(initialSliders);
  const [sliderFormMode, setSliderFormMode] = useState<SliderFormMode>(null);
  const [sliderEditingId, setSliderEditingId] = useState<number | null>(null);
  const [sliderForm, setSliderForm] = useState({ name: "", type: "" });

  const openSliderCreate = () => { setSliderForm({ name: "", type: "" }); setSliderEditingId(null); setSliderFormMode("create"); };
  const openSliderEdit = (s: SliderItem) => { setSliderForm({ name: s.name, type: s.type }); setSliderEditingId(s.id); setSliderFormMode("edit"); };
  const closeSliderForm = () => { setSliderFormMode(null); setSliderEditingId(null); };
  const saveSlider = () => {
    if (!sliderForm.name.trim() || !sliderForm.type) return;
    if (sliderFormMode === "edit" && sliderEditingId !== null) {
      setSliders((p) => p.map((s) => s.id === sliderEditingId ? { ...s, ...sliderForm } : s));
    } else {
      setSliders((p) => [...p, { id: Date.now(), ...sliderForm, slides: 0, active: true }]);
    }
    closeSliderForm();
  };
  const deleteSlider = (id: number) => { setSliders((p) => p.filter((s) => s.id !== id)); if (sliderEditingId === id) closeSliderForm(); };
  const toggleSliderActive = (id: number) => setSliders((p) => p.map((s) => s.id === id ? { ...s, active: !s.active } : s));

  // ── Banner state ──
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [bannerFormMode, setBannerFormMode] = useState<BannerFormMode>(null);
  const [bannerEditingId, setBannerEditingId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<Omit<BannerItem, "id">>(defaultBanner());

  const openBannerCreate = () => { setBannerForm(defaultBanner()); setBannerEditingId(null); setBannerFormMode("create"); };
  const openBannerEdit = (b: BannerItem) => {
    const { id, ...rest } = b;
    setBannerForm(rest);
    setBannerEditingId(id);
    setBannerFormMode("edit");
  };
  const closeBannerForm = () => { setBannerFormMode(null); setBannerEditingId(null); };
  const saveBanner = () => {
    if (!bannerForm.name.trim() || bannerForm.sliderId === null) return;
    if (bannerFormMode === "edit" && bannerEditingId !== null) {
      setBanners((p) => p.map((b) => b.id === bannerEditingId ? { id: bannerEditingId, ...bannerForm } : b));
    } else {
      setBanners((p) => [...p, { id: Date.now(), ...bannerForm }]);
    }
    closeBannerForm();
  };
  const deleteBanner = (id: number) => { setBanners((p) => p.filter((b) => b.id !== id)); if (bannerEditingId === id) closeBannerForm(); };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">სლაიდერები და ბანერები</h1>
        <button
          onClick={activeTab === "sliders" ? openSliderCreate : openBannerCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {activeTab === "sliders" ? "+ ახალი სლაიდერი" : "+ ახალი ბანერი"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["sliders", "banners"] as ActiveTab[]).map((tab) => {
          const label = tab === "sliders" ? "სლაიდერები" : "ბანერები";
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${active ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── SLIDERS TAB ── */}
      {activeTab === "sliders" && (
        <>
          <ComponentCard title="სლაიდერების სია">
            <SliderTable sliders={sliders} editingId={sliderEditingId} onEdit={openSliderEdit} onDelete={deleteSlider} onToggleActive={toggleSliderActive} />
          </ComponentCard>

          {sliderFormMode !== null && (
            <SliderFormPanel formMode={sliderFormMode} form={sliderForm} onChange={setSliderForm} onSave={saveSlider} onClose={closeSliderForm} />
          )}
        </>
      )}

      {/* ── BANNERS TAB ── */}
      {activeTab === "banners" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left: form (always visible on banners tab) */}
          <BannerFormPanel
            formMode={bannerFormMode ?? "create"}
            form={bannerForm}
            sliders={sliders}
            onChange={setBannerForm}
            onSave={saveBanner}
            onClose={closeBannerForm}
          />

          {/* Right: list + stats */}
          <div className="space-y-4">
            <BannerListCard banners={banners} sliders={sliders} editingId={bannerEditingId} onEdit={openBannerEdit} onDelete={deleteBanner} />
            <StatsCard sliders={sliders} banners={banners} />
          </div>
        </div>
      )}
    </div>
  );
}