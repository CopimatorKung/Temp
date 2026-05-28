import { useState } from 'react';
import { FiEdit2, FiFileText, FiImage, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import {
  categories,
  importQueue,
  mediaAssets,
  supportedFormats,
  type KnowledgeBook,
  type LibraryTab,
  type LibraryView,
} from '../mock-data';

export function KnowledgeLibraryNav({
  activeTab,
  activeView,
  onTabChange,
  onViewChange,
}: {
  activeTab: LibraryTab;
  activeView: LibraryView;
  onTabChange: (tab: LibraryTab) => void;
  onViewChange: (view: LibraryView) => void;
}) {
  const tabs: Array<{ id: LibraryTab; label: string }> = [
    { id: 'content', label: 'Content' },
    { id: 'favorite', label: 'Favorite' },
    { id: 'files', label: 'Files' },
    { id: 'media', label: 'Media' },
  ];

  return (
    <section className="grid gap-3 border-b border-border">
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            onMouseDown={() => onTabChange(tab.id)}
            className={[
              'border-b-2 px-1 pb-3 text-sm font-semibold transition',
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab !== 'favorite' && (
        <div className="flex flex-wrap gap-5">
          {[
            { id: 'table' as const, label: 'Table' },
            { id: 'grid' as const, label: 'Grid' },
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => onViewChange(view.id)}
              onMouseDown={() => onViewChange(view.id)}
              className={[
                'border-b-2 px-1 pb-2 text-sm font-semibold transition',
                activeView === view.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {view.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function KnowledgeResourcePanel({
  activeTab,
  activeView,
  selectedMediaIds,
  onToggleMedia,
  onSelectAllMedia,
}: {
  activeTab: Exclude<LibraryTab, 'content' | 'favorite'>;
  activeView: LibraryView;
  selectedMediaIds: string[];
  onToggleMedia: (mediaId: string) => void;
  onSelectAllMedia: () => void;
}) {
  const isMedia = activeTab === 'media';

  return (
    <section className="grid gap-5">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_180px_220px_180px_auto] lg:items-end">
            <Field label="Name">
              <Input placeholder={isMedia ? 'Search media name' : 'Search file name'} />
            </Field>
            <Field label={isMedia ? 'Media type' : 'File type'}>
              <Select defaultValue="any">
                <option value="any">- Any -</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="md">Markdown</option>
                <option value="xlsx">Spreadsheet</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select defaultValue="any">
                <option value="any">- Any -</option>
                <option value="thai">Thai</option>
                <option value="english">English</option>
              </Select>
            </Field>
            <Field label="Sort by">
              <Select defaultValue="newest">
                <option value="newest">Newest first</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
              </Select>
            </Field>
            <Button type="button" variant="secondary" className="lg:self-end">
              Apply filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-5">
          {isMedia ? (
            <label className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={selectedMediaIds.length === mediaAssets.length}
                onChange={onSelectAllMedia}
                className="h-5 w-5 rounded border-input accent-primary"
              />
              Select all media
              <span className="ml-auto text-xs font-semibold text-muted-foreground">{selectedMediaIds.length} selected</span>
            </label>
          ) : (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground">Imported files and normalized resources</div>
          )}

          {activeView === 'grid' ? (
            <div className={isMedia ? 'grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6' : 'grid gap-3 md:grid-cols-2 xl:grid-cols-3'}>
              {isMedia
                ? mediaAssets.map((asset) => (
                    <MediaAssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selectedMediaIds.includes(asset.id)}
                      onToggle={() => onToggleMedia(asset.id)}
                    />
                  ))
                : importQueue.map((item) => (
                    <FileResourceCard key={item.name} name={item.name} type={item.type} status={item.status} target={item.target} />
                  ))}
            </div>
          ) : (
            <ResourceTable activeTab={activeTab} selectedMediaIds={selectedMediaIds} onToggleMedia={onToggleMedia} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function MediaAssetCard({
  asset,
  selected,
  onToggle,
}: {
  asset: (typeof mediaAssets)[number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="grid min-w-0 gap-3">
      <div
        className={[
          'relative aspect-square overflow-hidden rounded-lg border bg-gradient-to-br shadow-sm transition',
          selected ? 'border-primary ring-2 ring-primary' : 'border-border',
          asset.tone,
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={`Select ${asset.name}`}
          className={[
            'absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-md border shadow-sm',
            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
          ].join(' ')}
        >
          {selected ? <FiCheckIcon /> : null}
        </button>
        <div className="absolute right-3 top-3 flex gap-2">
          <button type="button" aria-label={`Edit ${asset.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-foreground shadow-sm">
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button type="button" aria-label={`Remove ${asset.name}`} className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-foreground shadow-sm">
            <FiX className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/40 to-transparent p-4 text-primary-foreground">
          <FiImage className="h-5 w-5" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-foreground">{asset.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {asset.type} · {asset.language} · {asset.updated}
        </p>
      </div>
    </article>
  );
}

function FileResourceCard({ name, type, status, target }: { name: string; type: string; status: string; target: string }) {
  return (
    <article className="grid gap-3 rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
          <FiFileText className="h-5 w-5" />
        </span>
        <div className="flex gap-2">
          <button type="button" aria-label={`Edit ${name}`} className="grid h-8 w-8 place-items-center rounded-full bg-card text-muted-foreground shadow-sm">
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button type="button" aria-label={`Remove ${name}`} className="grid h-8 w-8 place-items-center rounded-full bg-card text-muted-foreground shadow-sm">
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div>
        <p className="break-words text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {type} → {target}
        </p>
      </div>
      <Badge tone={status === 'synced' ? 'success' : status === 'review' ? 'warning' : 'default'}>{status}</Badge>
    </article>
  );
}

function ResourceTable({
  activeTab,
  selectedMediaIds,
  onToggleMedia,
}: {
  activeTab: Exclude<LibraryTab, 'content'>;
  selectedMediaIds: string[];
  onToggleMedia: (mediaId: string) => void;
}) {
  const isMedia = activeTab === 'media';

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">{isMedia ? 'Language' : 'Target'}</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {(isMedia ? mediaAssets : importQueue).map((item) => {
            const selected = 'id' in item ? selectedMediaIds.includes(item.id) : false;

            return (
              <tr key={'id' in item ? item.id : item.name}>
                <td className="px-4 py-3 font-semibold text-foreground">
                  <div className="flex items-center gap-3">
                    {isMedia && 'id' in item ? (
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleMedia(item.id)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    ) : null}
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{'language' in item ? item.language : item.target}</td>
                <td className="px-4 py-3">
                  <Badge tone={'status' in item && item.status === 'review' ? 'warning' : 'default'}>{'status' in item ? item.status : 'ready'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FiCheckIcon() {
  return <span className="text-base leading-none">✓</span>;
}

export function UploadResourceModal({
  activePageTitle,
  books,
  onClose,
}: {
  activePageTitle: string;
  books: KnowledgeBook[];
  onClose: () => void;
}) {
  const defaultBook = books[0];
  const [destinationMode, setDestinationMode] = useState<'existing' | 'new'>('existing');
  const creatingNewBook = destinationMode === 'new';

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-resource-title"
          className="grid max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Knowledge import</p>
              <h2 id="upload-resource-title" className="mt-1 text-lg font-semibold text-foreground">
                Upload resource
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">นำไฟล์เข้า book library แล้ว normalize เป็น page ก่อน sync เข้า RAG</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close upload modal"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid max-h-[calc(100vh-12rem)] gap-5 overflow-y-auto p-5">
            <div className="grid gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
              <FiUploadCloud className="mx-auto h-7 w-7 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Drop files here or choose source</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  รองรับ {supportedFormats.join(', ')} และเลือกได้ว่าจะ map เข้า book เดิม หรือสร้างเป็น book ใหม่
                </p>
              </div>
              <Button type="button" className="mx-auto">
                <FiUploadCloud className="h-4 w-4" />
                Choose files
              </Button>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-secondary/25 p-3">
              <p className="text-sm font-semibold text-foreground">Import destination</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'existing' as const, label: 'Existing book', description: 'เพิ่ม resource เข้า book และ page ที่เลือกไว้' },
                  { id: 'new' as const, label: 'Create new book', description: 'สร้าง book ใหม่จากไฟล์ที่ upload รอบนี้' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setDestinationMode(mode.id)}
                    className={[
                      'rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      destinationMode === mode.id ? 'border-primary bg-primary/8 shadow-sm' : 'border-border bg-card hover:bg-secondary',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-semibold text-foreground">{mode.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{mode.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {creatingNewBook ? (
                <>
                  <Field label="New book name">
                    <Input defaultValue="Imported Sales Enablement Pack" />
                  </Field>
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
                  <Field label="Initial chapter">
                    <Input defaultValue="Imported Resources" />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Destination book">
                    <Select defaultValue={defaultBook?.id}>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Target page context">
                    <Input value={activePageTitle} readOnly />
                  </Field>
                </>
              )}
              <Field label="Import mode">
                <Select defaultValue="normalize-pages">
                  <option value="normalize-pages">Normalize into pages</option>
                  {!creatingNewBook && <option value="append-active">Append to active page</option>}
                  <option value="review-only">Review before sync</option>
                </Select>
              </Field>
              <Field label="RAG visibility">
                <Select defaultValue="published-only">
                  <option value="published-only">Published pages only</option>
                  <option value="manual-review">Manual review before index</option>
                  <option value="draft-hidden">Keep draft hidden</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-secondary/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">คิวนำเข้าเอกสาร</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {creatingNewBook
                      ? 'ไฟล์จะถูกจัดเป็น book ใหม่ พร้อม chapter/topic/page และรอ review ก่อน sync เข้า index'
                      : 'ไฟล์จะถูกแยก page, mapping metadata และส่งเข้า Kotaemon + LEANN หลังผ่าน review'}
                  </p>
                </div>
                <Badge tone="default">{creatingNewBook ? 'new book' : `${importQueue.length} resources`}</Badge>
              </div>
              <div className="grid gap-2">
                {importQueue.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.type} → {item.target}
                      </p>
                    </div>
                    <Badge tone={item.status === 'synced' ? 'success' : item.status === 'review' ? 'warning' : 'default'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onClose}>
              {creatingNewBook ? 'Create book and import' : 'Start import'}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
