import { FiBookOpen, FiPlus, FiUploadCloud } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

type KnowledgeHeaderProps = {
  onCreateBook: () => void;
  onUploadResource: () => void;
};

const ragStatusItems = [
  { label: 'Turso BM25', value: 'synced', tone: 'success' as const },
  { label: 'Kotaemon', value: 'ready', tone: 'default' as const },
  { label: 'LEANN', value: '2 pending', tone: 'warning' as const },
];

export function KnowledgeHeader({ onCreateBook, onUploadResource }: KnowledgeHeaderProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-panel md:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Knowledge Management</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">จัดการ Knowledge แบบ Book Library</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            สร้าง source เป็น book, chapter, topic และ page เพื่อให้ทีมขายอ่านง่าย เขียนแบบ Markdown ได้ และ sync เข้า RAG โดยคุม citation กลับมาที่ page เดิม
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
          {ragStatusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-1.5">
              <span className="text-xs font-semibold text-foreground">{item.label}</span>
              <Badge tone={item.tone}>{item.value}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={onCreateBook}>
          <FiPlus className="h-4 w-4" />
          Create book
        </Button>
        <Button type="button" variant="secondary" onClick={onUploadResource}>
          <FiUploadCloud className="h-4 w-4" />
          Upload resource
        </Button>
        <p className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
          <FiBookOpen className="h-3.5 w-3.5" />
          RAG Sync: source-first indexing
        </p>
      </div>
    </section>
  );
}
