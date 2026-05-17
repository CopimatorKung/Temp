import { FiBookOpen, FiX } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import { categories } from '../mock-data';

type CreateBookModalProps = {
  onClose: () => void;
};

export function CreateBookModal({ onClose }: CreateBookModalProps) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-book-title"
          className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Knowledge Book</p>
              <h2 id="create-book-title" className="mt-1 text-lg font-semibold text-foreground">
                Create book manually
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">สร้าง draft book พร้อม chapter, topic และ page แรกสำหรับเขียนต่อใน editor</p>
            </div>
            <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close create book modal">
              <FiX className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid gap-4 px-5 py-4">
            <Field label="Book title">
              <Input defaultValue="Q3 Enterprise Expansion Playbook" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select defaultValue="sales-playbook">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Owner">
                <Input defaultValue="Enablement" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First chapter">
                <Input defaultValue="Discovery and Qualification" />
              </Field>
              <Field label="First topic">
                <Input defaultValue="Budget Truth Questions" />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={4}
                defaultValue="Manual knowledge book สำหรับรวบรวม sales talk track, guardrail และ source ที่ต้อง sync กลับเข้า RAG ภายหลัง"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </Field>

            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
              Mock flow: หลังสร้าง ระบบจะเปิดหน้า book detail เป็น draft เพื่อให้เพิ่ม chapter/topic/page และ sync เข้า BM25 หรือ local RAG เมื่อ publish
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onClose}>
              <FiBookOpen className="h-4 w-4" />
              Create draft book
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
