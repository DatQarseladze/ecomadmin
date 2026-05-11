import { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterLink {
  id: number;
  name: string;
  url: string;
  order: number;
}

interface FooterSection {
  id: number;
  name: string;
  order: number;
  links: FooterLink[];
}

interface SocialLink {
  id: number;
  label: string;
  iconFile: string;
  url: string;
  order: number;
}

type LinkModalState = { mode: "add"; sectionId: number } | { mode: "edit"; sectionId: number; link: FooterLink } | null;
type SectionModalState = { section: FooterSection } | null;
type SocialModalState = { mode: "add" } | { mode: "edit"; social: SocialLink } | null;

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialSections: FooterSection[] = [
  {
    id: 1, name: "იმპექსის შესახებ", order: 1,
    links: [
      { id: 101, name: "ჩვენ შესახებ", url: "/about", order: 1 },
      { id: 102, name: "კარიერა", url: "/career", order: 2 },
      { id: 103, name: "პარტნიორები", url: "/partners", order: 3 },
    ],
  },
  {
    id: 2, name: "My Impex", order: 2,
    links: [
      { id: 201, name: "კატალოგი", url: "/catalog", order: 1 },
      { id: 202, name: "სიაბლლები", url: "/lists", order: 2 },
      { id: 203, name: "აქციები", url: "/deals", order: 3 },
    ],
  },
  {
    id: 3, name: "წესები და პირობები", order: 3,
    links: [
      { id: 301, name: "FAQ", url: "/faq", order: 1 },
      { id: 302, name: "კონტაქტი", url: "/contact", order: 2 },
    ],
  },
  {
    id: 4, name: "კონტაქტი", order: 4,
    links: [
      { id: 401, name: "კონფიდენციალობა", url: "/privacy", order: 1 },
      { id: 402, name: "წესები", url: "/terms", order: 2 },
    ],
  },
];

const initialBottomSections: FooterSection[] = [
  {
    id: 11, name: "სერვისი", order: 1,
    links: [
      { id: 1101, name: "მიწოდება", url: "/delivery", order: 1 },
      { id: 1102, name: "დაბრუნება", url: "/returns", order: 2 },
    ],
  },
  {
    id: 12, name: "ანგარიში", order: 2,
    links: [
      { id: 1201, name: "შესვლა", url: "/login", order: 1 },
      { id: 1202, name: "რეგისტრაცია", url: "/register", order: 2 },
    ],
  },
  {
    id: 13, name: "ენა", order: 3,
    links: [
      { id: 1301, name: "ქართული", url: "?lang=ka", order: 1 },
      { id: 1302, name: "English", url: "?lang=en", order: 2 },
    ],
  },
  {
    id: 14, name: "ვალუტა", order: 4,
    links: [
      { id: 1401, name: "GEL — ₾", url: "?currency=gel", order: 1 },
      { id: 1402, name: "USD — $", url: "?currency=usd", order: 2 },
    ],
  },
];

const initialSocials: SocialLink[] = [
  { id: 1, label: "FB", iconFile: "facebook.svg", url: "https://facebook.com", order: 1 },
  { id: 2, label: "IG", iconFile: "instagram.svg", url: "https://instagram.com", order: 2 },
  { id: 3, label: "YT", iconFile: "youtube.svg", url: "https://youtube.com", order: 3 },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const DragHandle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
    <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
  </svg>
);

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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {children}
      </div>
    </div>
  );
}

// ─── Link Modal ───────────────────────────────────────────────────────────────

type LinkModalProps = {
  state: NonNullable<LinkModalState>;
  onClose: () => void;
  onSave: (sectionId: number, data: Omit<FooterLink, "id">, linkId?: number) => void;
};

function LinkModal({ state, onClose, onSave }: LinkModalProps) {
  const existing = state.mode === "edit" ? state.link : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [order, setOrder] = useState(existing?.order ?? 1);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(state.sectionId, { name, url, order }, existing?.id);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">
        {state.mode === "edit" ? "ლინკის რედაქტირება" : "ლინკის დამატება"}
      </h2>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>დასახელება <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="ლინკის სახელი" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>URL <span className="text-red-500">*</span></label>
          <div className="relative">
            <input className={`${inputCls} pr-9`} placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><LinkIcon /></span>
          </div>
        </div>
        <div>
          <label className={labelCls}>მიმდევრობა</label>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-32">
            <button onClick={() => setOrder(o => Math.max(1, o - 1))} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">−</button>
            <span className="flex-1 text-center text-sm font-medium text-gray-800 dark:text-white/90">{order}</span>
            <button onClick={() => setOrder(o => o + 1)} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">+</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
        <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">შენახვა</button>
      </div>
    </Modal>
  );
}

// ─── Section Modal ────────────────────────────────────────────────────────────

function SectionModal({
  state, onClose, onSave,
}: {
  state: NonNullable<SectionModalState>;
  onClose: () => void;
  onSave: (id: number, name: string, order: number) => void;
}) {
  const { section } = state;
  const [name, setName] = useState(section.name);
  const [order, setOrder] = useState(section.order);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(section.id, name, order);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">სექციის რედაქტირება</h2>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>სახელი <span className="text-red-500">*</span></label>
          <input className={inputCls} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>მიმდევრობა</label>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-32">
            <button onClick={() => setOrder(o => Math.max(1, o - 1))} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">−</button>
            <span className="flex-1 text-center text-sm font-medium text-gray-800 dark:text-white/90">{order}</span>
            <button onClick={() => setOrder(o => o + 1)} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">+</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
        <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">შენახვა</button>
      </div>
    </Modal>
  );
}

// ─── Icon Upload ──────────────────────────────────────────────────────────────

function IconUpload({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => onChange(file.name);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className="text-xs text-center">
          <span className="text-blue-500 font-medium">SVG და PNG</span>
          <span className="text-gray-400"> — დაჭირეთ ასატვირთად</span>
        </p>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-500 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
          <span className="text-sm text-green-700 dark:text-green-400 flex-1 truncate">{value}</span>
          <button onClick={() => onChange("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}
      <input ref={inputRef} type="file" accept=".svg,.png" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ─── Social Modal ─────────────────────────────────────────────────────────────

function SocialModal({
  state, onClose, onSave,
}: {
  state: NonNullable<SocialModalState>;
  onClose: () => void;
  onSave: (data: Omit<SocialLink, "id">, id?: number) => void;
}) {
  const existing = state.mode === "edit" ? state.social : null;
  const [label, setLabel] = useState(existing?.label ?? "");
  const [iconFile, setIconFile] = useState(existing?.iconFile ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [order, setOrder] = useState(existing?.order ?? 1);

  const handleSave = () => {
    if (!url.trim()) return;
    onSave({ label, iconFile, url, order }, existing?.id);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">
        {state.mode === "edit" ? "სოც. ქსელის რედაქტირება" : "სოც. ქსელის დამატება"}
      </h2>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>ლეიბლი</label>
          <input className={inputCls} placeholder="FB" value={label} onChange={e => setLabel(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>აიქონი <span className="text-red-500">*</span></label>
          <IconUpload value={iconFile} onChange={setIconFile} />
        </div>
        <div>
          <label className={labelCls}>URL <span className="text-red-500">*</span></label>
          <div className="relative">
            <input className={`${inputCls} pr-9`} placeholder="https://facebook.com" value={url} onChange={e => setUrl(e.target.value)} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><LinkIcon /></span>
          </div>
        </div>
        <div>
          <label className={labelCls}>მიმდევრობა</label>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-32">
            <button onClick={() => setOrder(o => Math.max(1, o - 1))} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">−</button>
            <span className="flex-1 text-center text-sm font-medium text-gray-800 dark:text-white/90">{order}</span>
            <button onClick={() => setOrder(o => o + 1)} className="w-9 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-lg font-light flex-shrink-0">+</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">გაუქმება</button>
        <button onClick={handleSave} disabled={!url.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">შენახვა</button>
      </div>
    </Modal>
  );
}

// ─── DraggableLink ────────────────────────────────────────────────────────────

const LINK_TYPE = "footer-link";

interface DragLinkItem { type: string; id: number; index: number; sectionId: number }

function DraggableLink({
  link, index, sectionId, onMove, onEdit, onDelete,
}: {
  link: FooterLink;
  index: number;
  sectionId: number;
  onMove: (sectionId: number, from: number, to: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  const [{ isDragging }, drag, preview] = useDrag<DragLinkItem, unknown, { isDragging: boolean }>({
    type: LINK_TYPE,
    item: { type: LINK_TYPE, id: link.id, index, sectionId },
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [, drop] = useDrop<DragLinkItem>({
    accept: LINK_TYPE,
    hover(item) {
      if (item.sectionId !== sectionId || item.index === index) return;
      onMove(sectionId, item.index, index);
      item.index = index;
    },
  });

  drag(handleRef);
  preview(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }} className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
      <span ref={handleRef} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 flex-shrink-0">
        <DragHandle />
      </span>
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{link.name}</span>
      <span className="text-xs text-gray-400 font-mono flex-shrink-0">#{link.order}</span>
      <button onClick={onEdit} className="p-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
        <EditIcon />
      </button>
      <button onClick={onDelete} className="p-1 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
        <TrashIcon />
      </button>
    </div>
  );
}

// ─── DraggableSection ─────────────────────────────────────────────────────────

const SECTION_TYPE = "footer-section";

interface DragSectionItem { type: string; id: number; index: number }

function DraggableSectionCard({
  section, index, onMoveSection, onMoveLink, onEditSection, onAddLink, onEditLink, onDeleteLink,
}: {
  section: FooterSection;
  index: number;
  onMoveSection: (from: number, to: number) => void;
  onMoveLink: (sectionId: number, from: number, to: number) => void;
  onEditSection: () => void;
  onAddLink: () => void;
  onEditLink: (link: FooterLink) => void;
  onDeleteLink: (linkId: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<DragSectionItem, unknown, { isDragging: boolean }>({
    type: SECTION_TYPE,
    item: { type: SECTION_TYPE, id: section.id, index },
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop<DragSectionItem, unknown, { isOver: boolean }>({
    accept: SECTION_TYPE,
    hover(item) {
      if (item.index === index) return;
      onMoveSection(item.index, index);
      item.index = index;
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={`rounded-2xl border bg-white dark:bg-white/[0.03] transition-all ${isOver ? "border-blue-400 dark:border-blue-500" : "border-gray-200 dark:border-gray-800"}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{section.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">მიმდევრობა {section.order}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEditSection} className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <EditIcon />
          </button>
          <button onClick={onAddLink} className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        {section.links
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((link, i) => (
            <DraggableLink
              key={link.id}
              link={link}
              index={i}
              sectionId={section.id}
              onMove={onMoveLink}
              onEdit={() => onEditLink(link)}
              onDelete={() => onDeleteLink(link.id)}
            />
          ))}
        {section.links.length === 0 && (
          <p className="px-3 py-4 text-xs text-gray-400 text-center">ლინკები არ არის</p>
        )}
      </div>
    </div>
  );
}

// ─── Social Table ─────────────────────────────────────────────────────────────

function SocialTable({
  socials, onEdit, onDelete, onAdd, onChangeOrder,
}: {
  socials: SocialLink[];
  onEdit: (s: SocialLink) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onChangeOrder: (id: number, delta: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">სოციალური ქსელები</h3>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{socials.length}</span>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <PlusIcon /> დამატება
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-[80px_1fr_160px_80px] gap-0 px-6 py-2 bg-gray-50 dark:bg-gray-800/40 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>აიქონი</span>
          <span>URL</span>
          <span>მიმდევრობა</span>
          <span />
        </div>
        {socials.sort((a, b) => a.order - b.order).map(s => (
          <div key={s.id} className="grid grid-cols-[80px_1fr_160px_80px] gap-0 items-center px-6 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="flex flex-col items-start gap-1">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{s.label}</span>
              </div>
              <span className="text-[10px] text-gray-400">{s.iconFile}</span>
            </div>
            <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate pr-4">{s.url}</a>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-28">
              <button onClick={() => onChangeOrder(s.id, -1)} className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-base font-light">−</button>
              <span className="flex-1 text-center text-sm font-medium text-gray-800 dark:text-white/90">{s.order}</span>
              <button onClick={() => onChangeOrder(s.id, 1)} className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-base font-light">+</button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => onEdit(s)} className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"><EditIcon /></button>
              <button onClick={() => onDelete(s.id)} className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"><TrashIcon /></button>
            </div>
          </div>
        ))}
        {socials.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">სოც. ქსელები არ არის</p>
        )}
      </div>
    </div>
  );
}

// ─── Sections Zone ────────────────────────────────────────────────────────────

function SectionsZone({ label, zoneBadge, initialData }: { label: string; zoneBadge: string; initialData: FooterSection[] }) {
  const [sections, setSections] = useState<FooterSection[]>(initialData);
  const [linkModal, setLinkModal] = useState<LinkModalState>(null);
  const [sectionModal, setSectionModal] = useState<SectionModalState>(null);

  const moveSection = useCallback((from: number, to: number) => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(from, 1);
      sorted.splice(to, 0, moved);
      return sorted.map((s, i) => ({ ...s, order: i + 1 }));
    });
  }, []);

  const moveLink = useCallback((sectionId: number, from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const sorted = [...s.links].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(from, 1);
      sorted.splice(to, 0, moved);
      return { ...s, links: sorted.map((l, i) => ({ ...l, order: i + 1 })) };
    }));
  }, []);

  const saveLink = (sectionId: number, data: Omit<FooterLink, "id">, linkId?: number) => {
    setSections(prev => prev.map(s => {
      if (linkId !== undefined) {
        const withoutLink = { ...s, links: s.links.filter(l => l.id !== linkId) };
        if (s.id === sectionId) return { ...withoutLink, links: [...withoutLink.links, { id: linkId, ...data }] };
        return withoutLink;
      }
      if (s.id !== sectionId) return s;
      return { ...s, links: [...s.links, { id: Date.now(), ...data }] };
    }));
  };

  const deleteLink = (sectionId: number, linkId: number) => {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, links: s.links.filter(l => l.id !== linkId) }));
  };

  const saveSection = (id: number, name: string, order: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, name, order } : s));
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-mono">{zoneBadge}</span>
        <span className="ml-auto text-xs text-gray-400">{sortedSections.length} სექცია</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedSections.map((section, index) => (
          <DraggableSectionCard
            key={section.id}
            section={section}
            index={index}
            onMoveSection={moveSection}
            onMoveLink={moveLink}
            onEditSection={() => setSectionModal({ section })}
            onAddLink={() => setLinkModal({ mode: "add", sectionId: section.id })}
            onEditLink={link => setLinkModal({ mode: "edit", sectionId: section.id, link })}
            onDeleteLink={linkId => deleteLink(section.id, linkId)}
          />
        ))}
      </div>

      {linkModal && <LinkModal state={linkModal} onClose={() => setLinkModal(null)} onSave={saveLink} />}
      {sectionModal && <SectionModal state={sectionModal} onClose={() => setSectionModal(null)} onSave={saveSection} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FooterContent() {
  const [socials, setSocials] = useState<SocialLink[]>(initialSocials);
  const [socialModal, setSocialModal] = useState<SocialModalState>(null);
  const [saved, setSaved] = useState(false);

  const saveSocial = (data: Omit<SocialLink, "id">, id?: number) => {
    if (id !== undefined) {
      setSocials(prev => prev.map(s => s.id === id ? { id, ...data } : s));
    } else {
      setSocials(prev => [...prev, { id: Date.now(), ...data }]);
    }
  };

  const deleteSocial = (id: number) => setSocials(prev => prev.filter(s => s.id !== id));

  const changeSocialOrder = (id: number, delta: number) => {
    setSocials(prev => prev.map(s => s.id === id ? { ...s, order: Math.max(1, s.order + delta) } : s));
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">ფუტერის მართვა</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">სექციები, მიმდევრობა, ლინკები და სოც. ქსელები</p>
        </div>
        <button
          onClick={handleSaveAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {saved ? "✓ შენახულია" : "ყველა შენახვა"}
        </button>
      </div>

      {/* Top sections zone */}
      <SectionsZone label="ზედა განყოფილება" zoneBadge="zone: top" initialData={initialSections} />

      {/* Bottom sections zone */}
      <SectionsZone label="ქვედა განყოფილება" zoneBadge="zone: bottom" initialData={initialBottomSections} />

      {/* Social networks */}
      <SocialTable
        socials={socials}
        onEdit={s => setSocialModal({ mode: "edit", social: s })}
        onDelete={deleteSocial}
        onAdd={() => setSocialModal({ mode: "add" })}
        onChangeOrder={changeSocialOrder}
      />

      {socialModal && <SocialModal state={socialModal} onClose={() => setSocialModal(null)} onSave={saveSocial} />}
    </div>
  );
}

export default function FooterPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <FooterContent />
    </DndProvider>
  );
}
