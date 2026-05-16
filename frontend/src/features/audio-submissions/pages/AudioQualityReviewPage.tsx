import { useEffect, useState, type ReactNode } from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBarChart2,
  FiClipboard,
  FiFileText,
  FiLayers,
  FiMic,
  FiPlus,
  FiPlay,
  FiTrendingUp,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { buildPath } from '../../../app/routes';
import { TranscriptViewer } from '../../../components/audio/TranscriptViewer';
import { EvidenceDrawer } from '../../../components/scorecard/EvidenceDrawer';
import { ScorecardSummary } from '../../../components/scorecard/ScorecardSummary';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import { mockScorecard, mockTranscript, scorecardTemplates } from '../mock-data';
import { useAudioReviewStore } from '../store';
import type { ScorecardTemplate } from '../types';

const qualityTestRows = [
  {
    id: 'qt-001',
    name: 'Required opening or content intent',
    guidance: 'Sales standard / SEO Organizer',
    risk: 'medium',
    status: 'ready',
    score: '9/10',
  },
  {
    id: 'qt-002',
    name: 'Promotion terms completeness',
    guidance: 'Advertising compliance',
    risk: 'critical',
    status: 'needs review',
    score: '0/15',
  },
  {
    id: 'qt-003',
    name: 'Prohibited answer detection',
    guidance: 'Legal claim guardrail',
    risk: 'critical',
    status: 'ready',
    score: '-',
  },
  {
    id: 'qt-004',
    name: 'Evidence and source citation',
    guidance: 'Playbook source policy',
    risk: 'high',
    status: 'ready',
    score: '12/15',
  },
];

type ReviewTab = 'quality' | 'templates';
type TemplateTab = 'management' | 'validation';
type BatchStatus = 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
type BatchFileStatus = 'queued' | 'processing' | 'scored' | 'failed';

type BatchFile = {
  id: string;
  name: string;
  sourceType: 'audio' | 'document';
  status: BatchFileStatus;
  score?: number;
};

type ReviewBatch = {
  id: string;
  name: string;
  guidance: string;
  sourceType: 'audio' | 'document';
  status: BatchStatus;
  createdAt: string;
  files: BatchFile[];
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function AudioQualityReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReviewTab>('quality');
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('Pitch โปร Q2 Batch');
  const [newBatchSourceType, setNewBatchSourceType] = useState<'audio' | 'document'>('audio');
  const [newBatchTemplateId, setNewBatchTemplateId] = useState<string | undefined>();
  const [batches, setBatches] = useState<ReviewBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>();
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>();
  const [batchError, setBatchError] = useState<string | undefined>();
  const [runningBatchId, setRunningBatchId] = useState<string | undefined>();
  const {
    title,
    selectedTemplate,
    selectedEvidenceItemId,
    isLoadingTemplates,
    error,
    loadTemplates,
    selectTemplate,
    selectEvidenceItem,
  } = useAudioReviewStore();

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!newBatchTemplateId && selectedTemplate?.id) {
      setNewBatchTemplateId(selectedTemplate.id);
    }
  }, [newBatchTemplateId, selectedTemplate?.id]);

  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId);
  const selectedFile = selectedBatch?.files.find((file) => file.id === selectedFileId) ?? selectedBatch?.files[0];
  const completedFiles = selectedBatch?.files.filter((file) => file.status === 'scored').length ?? 0;

  const handleSelectTemplate = (id: string) => {
    selectTemplate(id);
    setNewBatchTemplateId(id);
    navigate(buildPath.templateDetail({ templateId: id }));
  };

  const createBatch = (input?: { name?: string; sourceType?: 'audio' | 'document'; templateId?: string }) => {
    const template = scorecardTemplates.find((entry) => entry.id === input?.templateId) ?? selectedTemplate;
    const sourceType = input?.sourceType ?? newBatchSourceType;
    const batchName = input?.name?.trim() || `${title} Batch`;

    if (!template) {
      setBatchError('Please select guidance/template before creating a batch.');
      return;
    }

    const now = new Date();
    const files: BatchFile[] =
      sourceType === 'audio'
        ? [
            { id: `file_${Date.now()}_1`, name: 'mock-call-01.webm', sourceType: 'audio', status: 'queued' },
            { id: `file_${Date.now()}_2`, name: 'mock-call-02.m4a', sourceType: 'audio', status: 'queued' },
            { id: `file_${Date.now()}_3`, name: 'mock-pitch-03.wav', sourceType: 'audio', status: 'queued' },
          ]
        : [
            { id: `file_${Date.now()}_1`, name: 'product-a-seo-article.md', sourceType: 'document', status: 'queued' },
            { id: `file_${Date.now()}_2`, name: 'q2-promotion-faq.docx', sourceType: 'document', status: 'queued' },
            { id: `file_${Date.now()}_3`, name: 'sales-script-objection.doc', sourceType: 'document', status: 'queued' },
            { id: `file_${Date.now()}_4`, name: 'landing-page-copy.txt', sourceType: 'document', status: 'queued' },
          ];

    const batch: ReviewBatch = {
      id: `batch_${Date.now()}`,
      name: batchName,
      guidance: template.name,
      sourceType,
      status: 'queued',
      createdAt: now.toISOString(),
      files,
    };

    setBatches((current) => [batch, ...current]);
    setBatchError(undefined);
    setIsNewBatchOpen(false);
  };

  const runBatch = async (batchId: string) => {
    if (runningBatchId) return;
    setRunningBatchId(batchId);
    setBatches((current) =>
      current.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status: 'processing',
              files: batch.files.map((file) => ({ ...file, status: file.status === 'scored' ? file.status : 'queued' })),
            }
          : batch,
      ),
    );

    const targetBatch = batches.find((batch) => batch.id === batchId);
    if (!targetBatch) {
      setRunningBatchId(undefined);
      return;
    }

    for (const [index, file] of targetBatch.files.entries()) {
      setBatches((current) =>
        current.map((batch) =>
          batch.id === batchId
            ? {
                ...batch,
                status: 'processing',
                files: batch.files.map((entry) => (entry.id === file.id ? { ...entry, status: 'processing' } : entry)),
              }
            : batch,
        ),
      );
      await sleep(700);
      setBatches((current) =>
        current.map((batch) =>
          batch.id === batchId
            ? {
                ...batch,
                files: batch.files.map((entry) =>
                  entry.id === file.id ? { ...entry, status: 'scored', score: index === 1 ? 64 : index === 2 ? 82 : 70 } : entry,
                ),
              }
            : batch,
        ),
      );
    }

    setBatches((current) =>
      current.map((batch) => (batch.id === batchId ? { ...batch, status: 'completed' } : batch)),
    );
    setRunningBatchId(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-4 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Module 1 · Quality Review Engine
            </p>
            <h1 className="mt-1.5 text-xl font-semibold text-foreground">เริ่ม Quality Review</h1>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              ตรวจเสียง เอกสาร หรือบทความด้วย rubric เฉพาะ เช่น sales standard, SEO Organizer และ legal claim guardrail
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <PageTabButton active={activeTab === 'quality'} onClick={() => setActiveTab('quality')} icon={<FiClipboard />}>
              Quality Check
            </PageTabButton>
            <PageTabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<FiLayers />}>
              Template Management
            </PageTabButton>
          </div>
        </div>
      </header>

      {activeTab === 'quality' ? (
        <main className="grid gap-5 p-5 lg:p-8">
          {!selectedBatch ? (
            <section className="grid content-start gap-5">
              <BatchOverview
                batches={batches}
                runningBatchId={runningBatchId}
                onNewBatch={() => {
                  setNewBatchName(`${title} Batch`);
                  setNewBatchSourceType('audio');
                  setNewBatchTemplateId(selectedTemplate?.id);
                  setIsNewBatchOpen(true);
                }}
                onOpen={(batch) => {
                  setSelectedBatchId(batch.id);
                  setSelectedFileId(batch.files[0]?.id);
                }}
                onRun={(batchId) => void runBatch(batchId)}
              />
              {(error || batchError) && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <FiAlertCircle className="h-4 w-4" />
                  {error ?? batchError}
                </div>
              )}
            </section>
          ) : (
            <section>
              <BatchDetail
                batch={selectedBatch}
                selectedFileId={selectedFile?.id}
                completedFiles={completedFiles}
                runningBatchId={runningBatchId}
                onBack={() => setSelectedBatchId(undefined)}
                onRun={(batchId) => void runBatch(batchId)}
                onSelectFile={setSelectedFileId}
                selectedEvidenceItemId={selectedEvidenceItemId}
                onSelectEvidenceItem={selectEvidenceItem}
              />
            </section>
          )}
        </main>
      ) : (
        <TemplateManagementPanel
          selectedTemplateId={selectedTemplate?.id}
          isLoading={isLoadingTemplates}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {isNewBatchOpen && (
        <NewBatchModal
          name={newBatchName}
          sourceType={newBatchSourceType}
          templateId={newBatchTemplateId}
          templates={scorecardTemplates}
          onNameChange={setNewBatchName}
          onSourceTypeChange={setNewBatchSourceType}
          onTemplateChange={setNewBatchTemplateId}
          onClose={() => setIsNewBatchOpen(false)}
          onCreate={() => createBatch({ name: newBatchName, sourceType: newBatchSourceType, templateId: newBatchTemplateId })}
        />
      )}
    </div>
  );
}

function NewBatchModal({
  name,
  sourceType,
  templateId,
  templates,
  onNameChange,
  onSourceTypeChange,
  onTemplateChange,
  onClose,
  onCreate,
}: {
  name: string;
  sourceType: 'audio' | 'document';
  templateId?: string;
  templates: ScorecardTemplate[];
  onNameChange: (value: string) => void;
  onSourceTypeChange: (value: 'audio' | 'document') => void;
  onTemplateChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/36 p-4" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-batch-dialog-title"
          className="w-full max-w-xl rounded-lg border border-border bg-card text-foreground shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 id="new-batch-dialog-title" className="text-base font-semibold">
                New Batch
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">ตั้งชื่อ batch และเลือก guidance ก่อนสร้าง queue</p>
            </div>
            <button
              type="button"
              aria-label="Close new batch dialog"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 p-5">
            <Field label="Batch name">
              <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
            </Field>

            <Field label="Guidance template">
              <Select value={templateId ?? ''} onChange={(event) => onTemplateChange(event.target.value)}>
                {templates.length === 0 ? (
                  <option value="">No template available</option>
                ) : (
                  templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))
                )}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSourceTypeChange('audio')}
                className={[
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  sourceType === 'audio' ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-white',
                ].join(' ')}
              >
                <FiMic className="h-4 w-4" />
                Audio files
              </button>
              <button
                type="button"
                onClick={() => onSourceTypeChange('document')}
                className={[
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  sourceType === 'document' ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-white',
                ].join(' ')}
              >
                <FiFileText className="h-4 w-4" />
                Documents
              </button>
            </div>

            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold">{sourceType === 'audio' ? 'Mock audio batch' : 'Mock document batch'}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {sourceType === 'audio'
                  ? 'จะสร้าง queue ตัวอย่าง 3 ไฟล์: webm, m4a, wav'
                  : 'จะสร้าง queue ตัวอย่าง 4 ไฟล์: .md, .docx, .doc, .txt'}
              </p>
              {sourceType === 'document' && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  รองรับ Markdown, plain text และ Word document สำหรับ batch review แบบ async เช่นเดียวกับไฟล์เสียง
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={!name.trim() || !templateId}>
              <FiPlus className="h-4 w-4" />
              Create batch
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function PageTabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition',
        active ? 'border-primary bg-primary text-primary-foreground shadow-panel' : 'border-border bg-background text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span className="text-base">{icon}</span>
      {children}
    </button>
  );
}

function BatchOverview({
  batches,
  runningBatchId,
  onNewBatch,
  onOpen,
  onRun,
}: {
  batches: ReviewBatch[];
  runningBatchId?: string;
  onNewBatch: () => void;
  onOpen: (batch: ReviewBatch) => void;
  onRun: (batchId: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Review Batches</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">สร้าง batch แล้วค่อยกดเข้าไปดู process และ result รายไฟล์</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={batches.length > 0 ? 'success' : 'muted'}>{batches.length} batches</Badge>
          <Button onClick={onNewBatch}>
            <FiPlus className="h-4 w-4" />
            New Batch
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Guidance</th>
                <th className="px-4 py-3 font-semibold">Files</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr className="border-t border-border bg-card">
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <p className="text-sm font-semibold">ยังไม่มี batch</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      กด New Batch เพื่อเลือก source และ template แล้วเริ่ม queue งานตรวจคุณภาพ
                    </p>
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const completed = batch.files.filter((file) => file.status === 'scored').length;
                  const isRunning = runningBatchId === batch.id;

                  return (
                    <tr key={batch.id} className="border-t border-border bg-card">
                      <td className="px-4 py-4">
                        <button className="text-left font-semibold text-primary hover:underline" onClick={() => onOpen(batch)}>
                          {batch.name}
                        </button>
                        <p className="mt-1 text-xs text-muted-foreground">{batch.sourceType} · {new Date(batch.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{batch.guidance}</td>
                      <td className="px-4 py-4">{completed}/{batch.files.length}</td>
                      <td className="px-4 py-4">
                        <Badge tone={batch.status === 'completed' ? 'success' : batch.status === 'processing' ? 'warning' : 'muted'}>
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={() => onOpen(batch)}>Open</Button>
                          <Button onClick={() => onRun(batch.id)} disabled={isRunning || batch.status === 'completed'}>
                            <FiPlay className="h-4 w-4" />
                            {isRunning ? 'Running' : 'Run'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function BatchDetail({
  batch,
  selectedFileId,
  completedFiles,
  runningBatchId,
  onBack,
  onRun,
  onSelectFile,
  selectedEvidenceItemId,
  onSelectEvidenceItem,
}: {
  batch: ReviewBatch;
  selectedFileId?: string;
  completedFiles: number;
  runningBatchId?: string;
  onBack: () => void;
  onRun: (batchId: string) => void;
  onSelectFile: (fileId: string) => void;
  selectedEvidenceItemId?: string;
  onSelectEvidenceItem: (itemId: string) => void;
}) {
  const selectedFile = batch.files.find((file) => file.id === selectedFileId) ?? batch.files[0];
  const hasResult = selectedFile?.status === 'scored';
  const isRunning = runningBatchId === batch.id;

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={onBack}>
              <FiArrowLeft className="h-4 w-4" />
              Back to batches
            </button>
            <CardTitle>{batch.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{batch.guidance}</p>
          </div>
          <Button onClick={() => onRun(batch.id)} disabled={isRunning || batch.status === 'completed'}>
            <FiPlay className="h-4 w-4" />
            {isRunning ? 'Running async' : batch.status === 'completed' ? 'Completed' : 'Run batch'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <BatchMetric label="Status" value={batch.status} />
          <BatchMetric label="Completed" value={`${completedFiles}/${batch.files.length}`} />
          <BatchMetric label="Source" value={batch.sourceType} />
          <BatchMetric label="Selected file" value={selectedFile?.name ?? '-'} />
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Files in batch</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">ระบบ mock จะ process แบบ async เรียงทีละไฟล์หรือทีละ document</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">File</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.files.map((file) => (
                      <tr
                        key={file.id}
                        className={[
                          'cursor-pointer border-t border-border bg-card transition hover:bg-muted',
                          selectedFile?.id === file.id ? 'bg-primary/5' : '',
                        ].join(' ')}
                        onClick={() => onSelectFile(file.id)}
                      >
                        <td className="px-4 py-4 font-medium">{file.name}</td>
                        <td className="px-4 py-4 text-muted-foreground">{file.sourceType}</td>
                        <td className="px-4 py-4">
                          <Badge tone={file.status === 'scored' ? 'success' : file.status === 'processing' ? 'warning' : 'muted'}>
                            {file.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-semibold">{file.score ? `${file.score}/100` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {hasResult ? (
            <div className="grid gap-5">
              <ScorecardSummary
                scorecard={{ ...mockScorecard, totalScore: selectedFile.score ?? mockScorecard.totalScore }}
                selectedItemId={selectedEvidenceItemId}
                onSelectItem={onSelectEvidenceItem}
                onOverride={() => undefined}
              />
              <QualityTestTable compact />
              <TranscriptViewer transcript={selectedFile.sourceType === 'audio' ? mockTranscript : undefined} />
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center">
                  <p className="text-sm font-semibold">ยังไม่มี result สำหรับไฟล์นี้</p>
                  <p className="mt-2 text-sm text-muted-foreground">กด Run batch แล้วระบบจะ process ไฟล์ตามลำดับ queue</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="grid content-start gap-5">
          <BatchOverviewPanel batch={batch} completedFiles={completedFiles} selectedFile={selectedFile} />
          {hasResult && (
            <EvidenceDrawer
              scorecard={{ ...mockScorecard, totalScore: selectedFile.score ?? mockScorecard.totalScore }}
              selectedItemId={selectedEvidenceItemId}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function BatchOverviewPanel({
  batch,
  completedFiles,
  selectedFile,
}: {
  batch: ReviewBatch;
  completedFiles: number;
  selectedFile?: BatchFile;
}) {
  const progress = Math.round((completedFiles / batch.files.length) * 100);
  const scoredFiles = batch.files.filter((file) => file.status === 'scored' && typeof file.score === 'number');
  const averageScore = scoredFiles.length > 0
    ? Math.round(scoredFiles.reduce((sum, file) => sum + (file.score ?? 0), 0) / scoredFiles.length)
    : 0;
  const queuedCount = batch.files.filter((file) => file.status === 'queued').length;
  const processingCount = batch.files.filter((file) => file.status === 'processing').length;
  const failedCount = batch.files.filter((file) => file.status === 'failed').length;
  const scoreBars = scoredFiles.length > 0 ? scoredFiles : batch.files;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Overview</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">ภาพรวมคะแนนและ progress ของ batch นี้</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Overall score</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{scoredFiles.length > 0 ? averageScore : '-'}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-white text-primary">
              <FiTrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{completedFiles}/{batch.files.length} files scored · {progress}% complete</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BatchMetric label="Queued" value={`${queuedCount}`} />
          <BatchMetric label="Processing" value={`${processingCount}`} />
          <BatchMetric label="Scored" value={`${scoredFiles.length}`} />
          <BatchMetric label="Failed" value={`${failedCount}`} />
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Score distribution</p>
          </div>
          <div className="grid gap-3">
            {scoreBars.map((file) => {
              const score = file.score ?? 0;
              return (
                <div key={file.id} className="grid gap-1">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-muted-foreground">{file.name}</span>
                    <span className="font-semibold">{file.score ? `${file.score}` : '-'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={[
                        'h-full rounded-full transition-all',
                        score >= 80 ? 'bg-success' : score >= 65 ? 'bg-warning' : score > 0 ? 'bg-destructive' : 'bg-border',
                      ].join(' ')}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Selected file</p>
          <p className="mt-1 truncate text-sm font-semibold">{selectedFile?.name ?? '-'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{selectedFile?.status ?? '-'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BatchMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function TemplateTable({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  columns,
}: {
  templates: ScorecardTemplate[];
  selectedTemplateId?: string;
  onSelectTemplate: (id: string) => void;
  columns: 'compact' | 'full';
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Template</th>
            <th className="px-4 py-3 font-semibold">Topic</th>
            {columns === 'full' && <th className="px-4 py-3 font-semibold">Scope</th>}
            {columns === 'full' && <th className="px-4 py-3 font-semibold">Version</th>}
            <th className="px-4 py-3 font-semibold">Sections</th>
            <th className="px-4 py-3 font-semibold">Published</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr
              key={template.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTemplate(template.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectTemplate(template.id);
                }
              }}
              className={[
                'cursor-pointer border-t border-border bg-card transition hover:bg-muted',
                selectedTemplateId === template.id ? 'bg-primary/5' : '',
              ].join(' ')}
            >
              <td className="px-4 py-4">
                <p className="font-semibold text-foreground">{template.name}</p>
                {columns === 'full' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.effectiveDate}
                    {template.expiryDate ? ` - ${template.expiryDate}` : ''}
                  </p>
                )}
              </td>
              <td className="px-4 py-4 text-muted-foreground">{template.topic}</td>
              {columns === 'full' && (
                <>
                  <td className="px-4 py-4 text-muted-foreground">
                    {template.customerSegment} · {template.product} · {template.region.toUpperCase()}
                  </td>
                  <td className="px-4 py-4 font-semibold">v{template.version}</td>
                </>
              )}
              <td className="px-4 py-4">{template.sections.length}</td>
              <td className="px-4 py-4">
                <Badge tone={template.status === 'published' ? 'success' : 'muted'}>{template.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TemplateManagementPanel({
  selectedTemplateId,
  isLoading,
  onSelectTemplate,
}: {
  selectedTemplateId?: string;
  isLoading: boolean;
  onSelectTemplate: (id: string) => void;
}) {
  const [templateTab, setTemplateTab] = useState<TemplateTab>('management');
  const managementTemplates = scorecardTemplates;

  return (
    <main className="grid gap-5 p-5 lg:p-8">
      <div className="grid content-start gap-5">
        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Template Management</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                แยกการจัดการ template ออกจาก validation test ที่ใช้ตรวจความพร้อมของ rubric
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isLoading && <FiRefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
              <SegmentTab active={templateTab === 'management'} onClick={() => setTemplateTab('management')} icon={<FiLayers />}>
                Templates
              </SegmentTab>
              <SegmentTab active={templateTab === 'validation'} onClick={() => setTemplateTab('validation')} icon={<FiClipboard />}>
                Validation Tests
              </SegmentTab>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {templateTab === 'management' ? (
              managementTemplates.length === 0 ? (
                <div className="p-5">
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                    ไม่พบ template ที่ตรงกับ filter ปัจจุบัน
                  </div>
                </div>
              ) : (
                <TemplateTable
                  templates={managementTemplates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={onSelectTemplate}
                  columns="full"
                />
              )
            ) : (
              <div>
                <div className="border-b border-border px-5 py-4">
                  <h3 className="text-base font-semibold text-foreground">Template Validation Tests</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ไม่ใช่ template หลัก แต่เป็น test case สำหรับตรวจว่า rubric พร้อมก่อนนำไปใช้จริง
                  </p>
                </div>
                <QualityTestTable />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function SegmentTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span className="text-base">{icon}</span>
      {children}
    </button>
  );
}

function QualityTestTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Test</th>
            {!compact && <th className="px-4 py-3 font-semibold">Guidance</th>}
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {qualityTestRows.map((row) => (
            <tr key={row.id} className="border-t border-border bg-card">
              <td className="px-4 py-3 font-medium">{row.name}</td>
              {!compact && <td className="px-4 py-3 text-muted-foreground">{row.guidance}</td>}
              <td className="px-4 py-3">
                <Badge tone={row.risk === 'critical' ? 'danger' : row.risk === 'high' ? 'warning' : 'muted'}>
                  {row.risk}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
              <td className="px-4 py-3 font-semibold">{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
