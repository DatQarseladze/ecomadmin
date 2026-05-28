import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { RichTextEditor } from "../../components/ui/rich-text-editor";
import DOMPurify from "dompurify";

export default function RichTextEditorPage() {
  const [content, setContent] = useState(
    "<h2>Welcome to the Rich Text Editor</h2><p>Start editing to see the formatted output below.</p>"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, send `content` (sanitized HTML) to the backend here
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sanitized = DOMPurify.sanitize(content, {
    ADD_TAGS: ["table", "thead", "tbody", "tfoot", "tr", "th", "td"],
    ADD_ATTR: ["colspan", "rowspan", "style", "class", "href", "target", "src", "alt"],
  });

  return (
    <>
      <PageMeta title="Rich Text Editor | Admin" description="Rich text editor with full formatting support" />
      <PageBreadcrumb pageTitle="Rich Text Editor" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Editor</h3>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your content here..."
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {saved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output panels */}
        <div className="flex flex-col gap-4">
          {/* Rendered Preview */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Preview</h3>
            <div
              className="rte-rendered border border-gray-100 dark:border-gray-800 rounded-xl min-h-[150px] px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </div>

          {/* Raw HTML Output */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">HTML Output (stored in backend)</h3>
            <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto max-h-48 overflow-y-auto" style={{ fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {sanitized}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
