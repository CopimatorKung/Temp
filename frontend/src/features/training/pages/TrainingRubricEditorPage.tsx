import { useState, type ReactNode } from 'react';
import { FiArrowLeft, FiCheck, FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { trainingRubrics } from './RecordingReviewPage';

const rubricSections = [
  {
    id: 'opening',
    name: 'Opening',
    weight: 20,
    rules: [
      { id: 'open-1', label: 'แนะนำตัวและวัตถุประสงค์', type: 'required_semantic', severity: 'medium', weight: 10 },
      { id: 'open-2', label: 'สร้าง rapport ก่อนเข้า pitch', type: 'quality_semantic', severity: 'low', weight: 10 },
    ],
  },
  {
    id: 'discovery',
    name: 'Pain Point Discovery',
    weight: 25,
    rules: [
      { id: 'disc-1', label: 'ถาม pain point ก่อนเสนอ solution', type: 'required_semantic', severity: 'high', weight: 15 },
      { id: 'disc-2', label: 'ถาม budget truth หรือ decision criteria', type: 'conditional_required', severity: 'high', weight: 10 },
    ],
  },
  {
    id: 'closing',
    name: 'Closing Next Step',
    weight: 15,
    rules: [
      { id: 'close-1', label: 'สรุป next step ที่ชัดเจน', type: 'required_semantic', severity: 'medium', weight: 15 },
    ],
  },
];

export function TrainingRubricEditorPage() {
  const { rubricId } = useParams();
  const rubric = trainingRubrics.find((entry) => entry.id === rubricId);
  const [editingDetail, setEditingDetail] = useState(false);

  if (!rubric) {
    return (
      <main className="p-5 lg:p-8">
        <Card>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center">
              <p className="text-sm font-semibold">ไม่พบ training rubric</p>
              <p className="mt-2 text-sm text-muted-foreground">ไม่พบเกณฑ์การฝึกที่ระบุ</p>
              <Link to={routes.recordingReview} className="mt-4 inline-flex">
                <Button>
                  <FiArrowLeft className="h-4 w-4" />
                  Back to Recordings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link to={routes.recordingReview} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <FiArrowLeft className="h-4 w-4" />
              Back to Recordings
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Training Rubric Editor</p>
            <h1 className="mt-1.5 text-xl font-semibold text-foreground">{rubric.name}</h1>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">แก้ไขรายละเอียด หัวข้อ กฎ และความพร้อมของเกณฑ์สำหรับการตรวจสอบเสียง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={rubric.status === 'published' ? 'success' : 'muted'}>{rubric.status}</Badge>
            <Button variant="secondary">Preview</Button>
            <Button>
              <FiSave className="h-4 w-4" />
              Save draft
            </Button>
          </div>
        </div>
      </header>

      <main className="grid gap-5 p-4 md:p-5 lg:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="grid min-w-0 content-start gap-5">
          <section className="rounded-lg border border-border bg-card p-4 shadow-panel">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rubric context</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{rubric.name}</h2>
                  <Badge tone={rubric.status === 'published' ? 'success' : 'muted'}>{rubric.status}</Badge>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">v{rubric.version.replace(/^v/, '')}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">ข้อมูลเกณฑ์ฉบับย่อสำหรับอ้างอิงเมื่อเลือกใช้กับชุดการบันทึกเสียง</p>
              </div>
              <div className="flex items-center gap-2">
                {editingDetail ? (
                  <>
                    <IconButton label="Save rubric detail" tone="success" onClick={() => setEditingDetail(false)} icon={<FiCheck className="h-4 w-4" />} />
                    <IconButton label="Cancel edit" onClick={() => setEditingDetail(false)} icon={<FiX className="h-4 w-4" />} />
                  </>
                ) : (
                  <IconButton label="Edit rubric detail" onClick={() => setEditingDetail(true)} icon={<FiEdit2 className="h-4 w-4" />} />
                )}
                <IconButton label="Delete rubric" tone="danger" onClick={() => undefined} icon={<FiTrash2 className="h-4 w-4" />} />
              </div>
            </div>

            {editingDetail ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Field label="Rubric name">
                    <Input defaultValue={rubric.name} />
                  </Field>
                  <Field label="Status">
                    <Select defaultValue={rubric.status}>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                    </Select>
                  </Field>
                  <Field label="Scenario">
                    <Input defaultValue={rubric.scenario} />
                  </Field>
                  <Field label="Version">
                    <Input defaultValue={rubric.version} />
                  </Field>
                  <Field label="Focus">
                    <Input defaultValue={rubric.focus} />
                  </Field>
                  <Field label="Sections">
                    <Input type="number" defaultValue={rubric.sections} />
                  </Field>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <CompactMeta label="Scenario" value={rubric.scenario} />
                <CompactMeta label="Focus" value={rubric.focus} />
                <CompactMeta label="Sections" value={`${rubric.sections}`} />
                <CompactMeta label="Latest use" value="2026-05-16" />
              </div>
            )}
          </section>

          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Sections and Rules</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">แก้ไขน้ำหนักคะแนน ระดับความสำคัญ และหลักฐานที่คาดหวังในแต่ละข้อ</p>
              </div>
              <Button variant="secondary">
                <FiPlus className="h-4 w-4" />
                Add section
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {rubricSections.map((section, sectionIndex) => (
                <div key={section.id} className="overflow-hidden rounded-lg border border-border bg-white">
                  <div className="grid gap-3 border-b border-border bg-muted p-4 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section {sectionIndex + 1}</p>
                      <p className="mt-1 font-semibold">{section.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{section.rules.length} rules</p>
                    </div>
                    <ReadOnlyValue label="Sort index" value={`${sectionIndex + 1}`} compact />
                    <ReadOnlyValue label="Weight" value={`${section.weight}`} compact />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Rule</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Severity</th>
                          <th className="px-4 py-3">Weight</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.rules.map((rule) => (
                          <tr key={rule.id} className="border-t border-border">
                            <td className="px-4 py-3 font-semibold">{rule.label}</td>
                            <td className="px-4 py-3">{rule.type}</td>
                            <td className="px-4 py-3">
                              <Badge tone={rule.severity === 'high' ? 'warning' : 'muted'}>{rule.severity}</Badge>
                            </td>
                            <td className="px-4 py-3">{rule.weight}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <IconButton label="Edit rule" onClick={() => undefined} icon={<FiEdit2 className="h-4 w-4" />} />
                                <IconButton label="Delete rule" tone="danger" onClick={() => undefined} icon={<FiTrash2 className="h-4 w-4" />} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="grid content-start gap-4 xl:sticky xl:top-5">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Validation Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-4 pt-0">
              <ReadOnlyValue label="Ready tests" value="2/3" compact />
              <ReadOnlyValue label="Needs review" value="1" compact />
              <ReadOnlyValue label="Latest batch use" value="2026-05-16" compact />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Batch Impact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-4 pt-0 text-sm text-muted-foreground">
              <p className="rounded-lg bg-muted p-3 leading-6">เกณฑ์นี้ถูกใช้กับชุดฝึกอยู่แล้ว คะแนนเดิมจะอ้างอิงเกณฑ์รุ่นเดิมเสมอ</p>
              <p className="rounded-lg bg-muted p-3 leading-6">หากต้องการเปลี่ยนกฎหรือน้ำหนักคะแนน ควรบันทึกเป็นเวอร์ชันใหม่ก่อนใช้กับชุดงานใหม่</p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function ReadOnlyValue({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={['rounded-lg border border-border bg-muted/45', compact ? 'p-3' : 'p-4'].join(' ')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-semibold">{value}</p>
    </div>
  );
}

function CompactMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/70 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function IconButton({ label, icon, tone = 'default', onClick }: { label: string; icon: ReactNode; tone?: 'default' | 'success' | 'danger'; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        tone === 'danger' ? 'border-destructive/30 text-destructive hover:bg-destructive/10' : '',
        tone === 'success' ? 'border-success/30 text-success hover:bg-success/10' : '',
        tone === 'default' ? 'border-border text-foreground hover:bg-muted' : '',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}
