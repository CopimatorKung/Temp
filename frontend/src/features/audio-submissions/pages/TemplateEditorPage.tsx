import { useState, type ReactNode } from 'react';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiFileText,
  FiMaximize2,
  FiMinimize2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { buildPath, routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import { scorecardTemplates } from '../mock-data';
import type { ScorecardTemplate } from '../types';

export function TemplateEditorPage() {
  const { templateId } = useParams();
  const template = scorecardTemplates.find((entry) => entry.id === templateId);
  const [openCards, setOpenCards] = useState({
    setup: true,
    sections: true,
    summary: true,
    checklist: true,
    route: true,
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openRules, setOpenRules] = useState<Record<string, boolean>>({});
  const [isTemplateDetailEditing, setIsTemplateDetailEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const setAllCards = (open: boolean) => {
    setOpenCards({
      setup: open,
      sections: open,
      summary: open,
      checklist: open,
      route: open,
    });
  };

  const toggleCard = (key: keyof typeof openCards) => {
    setOpenCards((current) => ({ ...current, [key]: !current[key] }));
  };
  const toggleSection = (id: string) => {
    setOpenSections((current) => ({ ...current, [id]: !(current[id] ?? true) }));
  };
  const toggleRule = (id: string) => {
    setOpenRules((current) => ({ ...current, [id]: !(current[id] ?? true) }));
  };

  if (!template) {
    return (
      <main className="p-5 lg:p-8">
        <Card>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center">
              <p className="text-sm font-semibold">ไม่พบ template</p>
              <p className="mt-2 text-sm text-muted-foreground">ไม่พบเกณฑ์ประเมินที่ระบุ</p>
              <Link to={routes.audioNew} className="mt-4 inline-flex">
                <Button>
                  <FiArrowLeft className="h-4 w-4" />
                  Back to Quality
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const totalRules = template.sections.reduce((sum, section) => sum + section.items.length, 0);
  const criticalRules = template.sections.reduce(
    (sum, section) => sum + section.items.filter((item) => item.severity === 'critical').length,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link to={routes.audioNew} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <FiArrowLeft className="h-4 w-4" />
              Back to Quality
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Template Editor
            </p>
            <h1 className="mt-1.5 text-xl font-semibold text-foreground">{template.name}</h1>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              แก้ไขรายละเอียด ขอบเขต หัวข้อ และกฎการให้คะแนนสำหรับเกณฑ์ประเมิน
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={template.status === 'published' ? 'success' : 'muted'}>{template.status}</Badge>
            <TooltipAction label="Expand all editor cards">
              <Button variant="secondary" onClick={() => setAllCards(true)} aria-label="Expand all editor cards" className="w-10 px-0">
                <FiMaximize2 className="h-4 w-4" />
              </Button>
            </TooltipAction>
            <TooltipAction label="Collapse all editor cards">
              <Button variant="secondary" onClick={() => setAllCards(false)} aria-label="Collapse all editor cards" className="w-10 px-0">
                <FiMinimize2 className="h-4 w-4" />
              </Button>
            </TooltipAction>
            <TooltipAction label="Preview what this template will evaluate">
              <Button variant="secondary" onClick={() => setIsPreviewOpen(true)} aria-label="Preview template evaluation report">
                <FiEye className="h-4 w-4" />
                Preview
              </Button>
            </TooltipAction>
            <TooltipAction label="Save changes as draft">
              <Button aria-label="Save template draft">
                <FiSave className="h-4 w-4" />
                Save draft
              </Button>
            </TooltipAction>
          </div>
        </div>
      </header>

      <main className="grid min-w-0 gap-5 p-4 md:p-5 xl:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <section className="grid min-w-0 content-start gap-5">
          <CollapsibleCard
            title="Template Detail"
            description="ข้อมูลหลักสำหรับเชื่อมโยงเกณฑ์ประเมินกับชุดงาน"
            open={openCards.setup}
            onToggle={() => toggleCard('setup')}
            actions={
              <div className="flex items-center gap-2">
                {isTemplateDetailEditing && <Badge tone="warning">editing</Badge>}
                {isTemplateDetailEditing ? (
                  <>
                    <IconButton
                      label="Save template detail"
                      tone="success"
                      onClick={() => setIsTemplateDetailEditing(false)}
                      icon={<FiCheck className="h-4 w-4" />}
                    />
                    <IconButton
                      label="Cancel template detail edit"
                      onClick={() => setIsTemplateDetailEditing(false)}
                      icon={<FiX className="h-4 w-4" />}
                    />
                  </>
                ) : (
                  <IconButton
                    label="Edit template detail"
                    onClick={() => setIsTemplateDetailEditing(true)}
                    icon={<FiEdit2 className="h-4 w-4" />}
                  />
                )}
                <IconButton
                  label="Delete template detail"
                  tone="danger"
                  onClick={() => undefined}
                  icon={<FiTrash2 className="h-4 w-4" />}
                />
              </div>
            }
          >
            <CardContent
              className={[
                'grid min-w-0 gap-4 md:grid-cols-2',
                isTemplateDetailEditing ? 'bg-warning/5 ring-1 ring-inset ring-warning/20' : '',
              ].join(' ')}
            >
              {isTemplateDetailEditing ? (
                <>
                  <Field label="Template name">
                    <Input defaultValue={template.name} />
                  </Field>
                  <Field label="Status">
                    <Select defaultValue={template.status}>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                    </Select>
                  </Field>
                  <Field label="Topic">
                    <Input defaultValue={template.topic} />
                  </Field>
                  <Field label="Customer segment">
                    <Input defaultValue={template.customerSegment} />
                  </Field>
                  <Field label="Product">
                    <Input defaultValue={template.product} />
                  </Field>
                  <Field label="Region">
                    <Input defaultValue={template.region.toUpperCase()} />
                  </Field>
                  <Field label="Effective date">
                    <Input type="date" defaultValue={template.effectiveDate} />
                  </Field>
                  <Field label="Expiry date">
                    <Input type="date" defaultValue={template.expiryDate ?? ''} />
                  </Field>
                </>
              ) : (
                <>
                  <ReadOnlyValue label="Template name" value={template.name} />
                  <ReadOnlyValue label="Status" value={template.status} />
                  <ReadOnlyValue label="Topic" value={template.topic} />
                  <ReadOnlyValue label="Customer segment" value={template.customerSegment} />
                  <ReadOnlyValue label="Product" value={template.product} />
                  <ReadOnlyValue label="Region" value={template.region.toUpperCase()} />
                  <ReadOnlyValue label="Effective date" value={template.effectiveDate} />
                  <ReadOnlyValue label="Expiry date" value={template.expiryDate ?? '-'} />
                </>
              )}
            </CardContent>
          </CollapsibleCard>

          <CollapsibleCard
            title="Sections and Rules"
            description="แก้ไขน้ำหนักคะแนน ระดับความสำคัญ และหลักฐานที่คาดหวังในแต่ละข้อ"
            open={openCards.sections}
            onToggle={() => toggleCard('sections')}
            actions={
              <Button variant="secondary" className="h-9 px-3" onClick={(event) => event.stopPropagation()}>
                <FiPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add section</span>
              </Button>
            }
          >
            <CardContent className="grid min-w-0 gap-4 p-3 sm:p-5">
              {template.sections.map((section, sectionIndex) => {
                const sectionOpen = openSections[section.id] ?? false;

                return (
                  <div key={section.id} className="min-w-0 rounded-lg border border-border bg-white">
                    <div className="grid min-w-0 gap-3 border-b border-border p-3 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-end sm:p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={sectionOpen}
                        className="flex min-w-0 items-start gap-3 rounded-lg text-left transition hover:text-primary"
                      >
                        <span className="mt-1 text-muted-foreground">
                          {sectionOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">Section {section.sortIndex ?? sectionIndex + 1}</span>
                          <span className="mt-1 block text-base font-semibold">{section.label}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{section.items.length} rules</span>
                        </span>
                      </button>
                      <ReadOnlyValue label="Sort index" value={section.sortIndex ?? sectionIndex + 1} />
                      <ReadOnlyValue label="Weight" value={section.weight} />
                    </div>

                    {sectionOpen && (
                      <div className="grid min-w-0 gap-3 p-3 sm:p-4">
                        {section.items.map((item, itemIndex) => {
                          const ruleKey = `${section.id}:${item.id}`;
                          const ruleOpen = openRules[ruleKey] ?? true;
                          const example = item.example ?? `ตัวอย่าง evidence: ${item.expectedEvidence}`;

                          return (
                            <div key={item.id} className="min-w-0 rounded-lg border border-border bg-muted">
                              <div className="grid min-w-0 gap-3 border-b border-border p-3 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-end">
                                <button
                                  type="button"
                                  onClick={() => toggleRule(ruleKey)}
                                  aria-expanded={ruleOpen}
                                  className="flex min-w-0 items-start gap-3 rounded-lg text-left transition hover:text-primary"
                                >
                                  <span className="mt-1 text-muted-foreground">
                                    {ruleOpen ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">Rule {item.sortIndex ?? itemIndex + 1}</span>
                                    <span className="mt-1 block font-semibold">{item.label}</span>
                                    <span className="mt-2 flex flex-wrap gap-2">
                                      <Badge tone="muted">{item.type}</Badge>
                                      <Badge tone={item.severity === 'critical' ? 'danger' : item.severity === 'high' ? 'warning' : 'muted'}>
                                        {item.severity}
                                      </Badge>
                                    </span>
                                  </span>
                                </button>
                                <ReadOnlyValue label="Sort index" value={item.sortIndex ?? itemIndex + 1} />
                                <div className="flex items-end gap-2 md:pb-0.5">
                                  <IconButton
                                    label={`Edit rule ${item.sortIndex ?? itemIndex + 1}`}
                                    onClick={() => undefined}
                                    icon={<FiEdit2 className="h-4 w-4" />}
                                  />
                                  <IconButton
                                    label={`Delete rule ${item.sortIndex ?? itemIndex + 1}`}
                                    tone="danger"
                                    onClick={() => undefined}
                                    icon={<FiTrash2 className="h-4 w-4" />}
                                  />
                                </div>
                              </div>

                              {ruleOpen && (
                                <div className="grid min-w-0 gap-3 p-3 md:grid-cols-2 2xl:grid-cols-[minmax(220px,1fr)_120px_160px_120px]">
                                  <ReadOnlyValue label="Rule" value={item.label} />
                                  <ReadOnlyValue label="Weight" value={item.weight} />
                                  <ReadOnlyValue label="Type" value={item.type} />
                                  <ReadOnlyValue label="Severity" value={item.severity} />
                                  <div className="md:col-span-2 2xl:col-span-4">
                                    <ReadOnlyTextBlock label="Expected evidence" value={item.expectedEvidence} />
                                  </div>
                                  <div className="md:col-span-2 2xl:col-span-4">
                                    <ReadOnlyTextBlock label="Example" value={example} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </CollapsibleCard>
        </section>

        <aside className="grid content-start gap-5">
          <CollapsibleCard title="Summary" open={openCards.summary} onToggle={() => toggleCard('summary')}>
            <CardContent className="grid gap-3">
              <TemplateMetric label="Version" value={`v${template.version}`} />
              <TemplateMetric label="Total weight" value={`${template.totalWeight}`} />
              <TemplateMetric label="Sections" value={`${template.sections.length}`} />
              <TemplateMetric label="Rules" value={`${totalRules}`} />
              <TemplateMetric label="Critical rules" value={`${criticalRules}`} />
            </CardContent>
          </CollapsibleCard>

          <CollapsibleCard title="Publish Checklist" open={openCards.checklist} onToggle={() => toggleCard('checklist')}>
            <CardContent className="grid gap-3">
              {['Owner และ version ชัดเจน', 'มี evidence policy', 'critical rules ถูกกำหนด severity', 'effective/expiry date ครบถ้วน'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 text-sm">
                  <FiCheckCircle className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </CardContent>
          </CollapsibleCard>

          <CollapsibleCard title="Route" open={openCards.route} onToggle={() => toggleCard('route')}>
            <CardContent>
              <p className="break-all rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
                {buildPath.templateDetail({ templateId: template.id })}
              </p>
            </CardContent>
          </CollapsibleCard>
        </aside>
      </main>
      {isPreviewOpen && (
        <TemplatePreviewModal
          template={template}
          totalRules={totalRules}
          criticalRules={criticalRules}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}

function TemplatePreviewModal({
  template,
  totalRules,
  criticalRules,
  onClose,
}: {
  template: ScorecardTemplate;
  totalRules: number;
  criticalRules: number;
  onClose: () => void;
}) {
  const highRiskRules = template.sections.flatMap((section) =>
    section.items
      .filter((item) => item.severity === 'critical' || item.severity === 'high')
      .map((item) => ({ ...item, sectionLabel: section.label })),
  );

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-sm" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-preview-title"
          className="grid max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-soft"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Template preview report</p>
              <h2 id="template-preview-title" className="mt-1 text-xl font-semibold text-foreground">
                {template.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                รายงานตัวอย่างว่า template นี้จะตรวจอะไร ก่อนนำไปใช้กับ batch/source จริง
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close template preview"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="grid max-h-[calc(88vh-142px)] gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="grid content-start gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <PreviewMetric label="Topic" value={template.topic} />
                <PreviewMetric label="Segment" value={template.customerSegment} />
                <PreviewMetric label="Product" value={template.product} />
                <PreviewMetric label="Language" value={template.language.toUpperCase()} />
              </div>

              <div className="rounded-lg border border-border bg-muted/60 p-4">
                <div className="flex items-center gap-2">
                  <FiFileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">What this template evaluates</h3>
                </div>
                <div className="mt-4 grid gap-3">
                  {template.sections.map((section) => (
                    <div key={section.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{section.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {section.items.length} rules · {section.weight} weight
                          </p>
                        </div>
                        <Badge tone="muted">{section.sortIndex ? `section ${section.sortIndex}` : 'section'}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {section.items.map((item) => (
                          <div key={item.id} className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{item.label}</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.expectedEvidence}</p>
                            </div>
                            <div className="flex flex-wrap items-start gap-2">
                              <Badge tone={item.severity === 'critical' ? 'danger' : item.severity === 'high' ? 'warning' : 'muted'}>
                                {item.severity}
                              </Badge>
                              <Badge tone="muted">{item.weight} pts</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="grid content-start gap-4">
              <div className="rounded-lg border border-border bg-muted/60 p-4">
                <h3 className="font-semibold text-foreground">Evaluation summary</h3>
                <div className="mt-3 grid gap-2">
                  <PreviewMetric label="Version" value={`v${template.version}`} />
                  <PreviewMetric label="Total weight" value={`${template.totalWeight}`} />
                  <PreviewMetric label="Sections" value={`${template.sections.length}`} />
                  <PreviewMetric label="Rules" value={`${totalRules}`} />
                  <PreviewMetric label="Critical rules" value={`${criticalRules}`} />
                </div>
              </div>

              <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="h-4 w-4 text-warning" />
                  <h3 className="font-semibold text-foreground">High attention rules</h3>
                </div>
                <div className="mt-3 grid gap-2">
                  {highRiskRules.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-card p-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{item.sectionLabel}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.label}</p>
                      <Badge tone={item.severity === 'critical' ? 'danger' : 'warning'}>{item.severity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Supported sources</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Audio call, uploaded recording, document, article หรือ prepared answer ที่เลือกใช้กับ batch ได้
                </p>
              </div>
            </aside>
          </div>

          <div className="flex justify-end border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={onClose}>Close preview</Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function PreviewMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 min-w-0 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TooltipAction({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-56 -translate-x-1/2 rounded-md border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
      {children}
    </span>
  );
}

function CollapsibleCard({
  title,
  description,
  open,
  onToggle,
  actions,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="p-0">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-start gap-3 px-5 py-4 text-left transition hover:bg-muted/70"
          >
            <span className="mt-0.5 text-muted-foreground">
              {open ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <CardTitle>{title}</CardTitle>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </span>
          </button>
          {actions && <div className="shrink-0 pr-5">{actions}</div>}
        </div>
      </CardHeader>
      {open && children}
    </Card>
  );
}

function TemplateMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function IconButton({
  label,
  icon,
  tone = 'default',
  onClick,
}: {
  label: string;
  icon: ReactNode;
  tone?: 'default' | 'danger' | 'success';
  onClick: () => void;
}) {
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
        tone === 'danger'
          ? 'border-destructive/25 text-destructive hover:bg-destructive/10'
          : tone === 'success'
            ? 'border-success/25 text-success hover:bg-success/10'
            : 'border-border text-muted-foreground hover:bg-card hover:text-primary',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}

function ReadOnlyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      <p className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{value}</p>
    </div>
  );
}

function ReadOnlyTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <p className="min-h-12 rounded-lg border-l-2 border-primary/30 bg-white/45 px-3 py-2 text-sm leading-6 text-muted-foreground">
        {value}
      </p>
    </div>
  );
}
