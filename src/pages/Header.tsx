import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderLink {
  id: number;
  name: string;
  url: string;
  order: number;
}

type LinkModalState = { mode: "add" } | { mode: "edit"; link: HeaderLink } | null;

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialLinks: HeaderLink[] = [
  { id: 1, name: "აქციები", url: "https://", order: 1 },
  { id: 2, name: "ივენთები", url: "https://", order: 2 },
  { id: 3, name: "ფილიალები", url: "https://", order: 3 },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── Modal ────────────────────────────────────────────────────────────────────

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

function LinkModal({
  state, onClose, onSave,
}: {
  state: NonNullable<LinkModalState>;
  onClose: () => void;
  onSave: (data: Omit<HeaderLink, "id">, id?: number) => void;
}) {
  const existing = state.mode === "edit" ? state.link : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [order, setOrder] = useState(existing?.order ?? 1);

  const handleSave = () => {
    if (!url.trim()) return;
    onSave({ name, url, order }, existing?.id);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">რედაქტირება</h2>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>დასახელება</label>
          <input className={inputCls} placeholder="ბმულის სახელი" value={name} onChange={e => setName(e.target.value)} />
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
        <button onClick={handleSave} disabled={!url.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">შენახვა</button>
      </div>
    </Modal>
  );
}

// ─── Links Table ──────────────────────────────────────────────────────────────

function LinksTable({
  links, onAdd, onEdit, onDelete, onChangeOrder,
}: {
  links: HeaderLink[];
  onAdd: () => void;
  onEdit: (link: HeaderLink) => void;
  onDelete: (id: number) => void;
  onChangeOrder: (id: number, delta: number) => void;
}) {
  const sorted = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">ჰედერი</h3>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{links.length}</span>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <PlusIcon /> დამატება
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_160px_80px] gap-0 px-6 py-2 bg-gray-50 dark:bg-gray-800/40 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>დასახელება</span>
          <span>URL</span>
          <span>მიმდევრობა</span>
          <span />
        </div>

        {sorted.map(link => (
          <div key={link.id} className="grid grid-cols-[1fr_1fr_160px_80px] gap-0 items-center px-6 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <span className="text-sm text-gray-800 dark:text-white/80 font-medium">{link.name || <span className="text-gray-400 font-normal italic">—</span>}</span>
            <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate pr-4">{link.url}</a>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-28">
              <button onClick={() => onChangeOrder(link.id, -1)} className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-base font-light">−</button>
              <span className="flex-1 text-center text-sm font-medium text-gray-800 dark:text-white/90">{link.order}</span>
              <button onClick={() => onChangeOrder(link.id, 1)} className="w-8 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300 text-base font-light">+</button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => onEdit(link)} className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"><EditIcon /></button>
              <button onClick={() => onDelete(link.id)} className="p-1.5 rounded border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"><TrashIcon /></button>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">ბმულები არ არის</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeaderPage() {
  const [links, setLinks] = useState<HeaderLink[]>(initialLinks);
  const [linkModal, setLinkModal] = useState<LinkModalState>(null);
  const [saved, setSaved] = useState(false);

  const saveLink = (data: Omit<HeaderLink, "id">, id?: number) => {
    if (id !== undefined) {
      setLinks(prev => prev.map(l => l.id === id ? { id, ...data } : l));
    } else {
      setLinks(prev => [...prev, { id: Date.now(), ...data }]);
    }
  };

  const deleteLink = (id: number) => setLinks(prev => prev.filter(l => l.id !== id));

  const changeOrder = (id: number, delta: number) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, order: Math.max(1, l.order + delta) } : l));
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">ჰედერის მართვა</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ნავიგაცია და ბმულები</p>
        </div>
        <button
          onClick={handleSaveAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {saved ? "✓ შენახულია" : "ყველა შენახვა"}
        </button>
      </div>

      {/* Navigation links */}
      <LinksTable
        links={links}
        onAdd={() => setLinkModal({ mode: "add" })}
        onEdit={link => setLinkModal({ mode: "edit", link })}
        onDelete={deleteLink}
        onChangeOrder={changeOrder}
      />

      {linkModal && <LinkModal state={linkModal} onClose={() => setLinkModal(null)} onSave={saveLink} />}
    </div>
  );
}
