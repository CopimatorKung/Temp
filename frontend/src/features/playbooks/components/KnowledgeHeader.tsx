import { FiBookOpen, FiPlus, FiSliders } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';

type KnowledgeHeaderProps = {
  onCreateBook: () => void;
  onOpenTools: () => void;
};

export function KnowledgeHeader({ onCreateBook, onOpenTools }: KnowledgeHeaderProps) {
  return (
    <section className="rounded-lg border border-border bg-card px-4 py-4 shadow-panel md:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">จัดการ Playbooks สำหรับทีมขาย</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            โฟกัสที่ book, chapter, topic และ page ที่ทีมใช้ซ้อม Senario, quality review และตอบ objection โดยอ้างอิง source เดิมได้
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onCreateBook}>
            <FiPlus className="h-4 w-4" />
            Create book
          </Button>
          <Button type="button" variant="secondary" onClick={onOpenTools}>
            <FiSliders className="h-4 w-4" />
            Library tools
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <FiBookOpen className="h-3.5 w-3.5" />
          Source-first indexing
        </span>
        <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/50 sm:inline-block" />
        <span>Secondary files, media, sync status และ import queue อยู่ใน Library tools</span>
      </div>
    </section>
  );
}
