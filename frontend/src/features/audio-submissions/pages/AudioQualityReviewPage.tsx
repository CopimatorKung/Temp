import { useEffect, useState, type ReactNode } from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBarChart2,
  FiCheck,
  FiClipboard,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiLayers,
  FiMic,
  FiMoreVertical,
  FiPause,
  FiPlus,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiUploadCloud,
  FiVolume2,
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

type QualityTranscriptSegment = {
  id: number;
  start: string;
  end: string;
  speaker: 'Sales' | 'Customer';
  text: string;
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

  const uploadFilesToBatch = (batchId: string, files: BatchFile[]) => {
    setBatches((current) =>
      current.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status: batch.status === 'completed' ? 'queued' : batch.status,
              files: [...batch.files, ...files],
            }
          : batch,
      ),
    );
    if (files[0]) {
      setSelectedFileId(files[0].id);
    }
  };

  const deleteFileFromBatch = (batchId: string, fileId: string) => {
    setBatches((current) =>
      current.map((batch) => {
        if (batch.id !== batchId) return batch;
        const files = batch.files.filter((file) => file.id !== fileId);
        return {
          ...batch,
          status: files.some((file) => file.status !== 'scored') ? 'queued' : 'completed',
          files,
        };
      }),
    );

    if (selectedFileId === fileId) {
      const nextFile = batches.find((batch) => batch.id === batchId)?.files.find((file) => file.id !== fileId);
      setSelectedFileId(nextFile?.id);
    }
  };

  const reEvaluateFile = async (batchId: string, fileId: string) => {
    if (runningBatchId) return;
    setBatches((current) =>
      current.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status: 'processing',
              files: batch.files.map((file) => (file.id === fileId ? { ...file, status: 'processing' } : file)),
            }
          : batch,
      ),
    );
    await sleep(600);
    setBatches((current) =>
      current.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status: batch.files.every((file) => file.id === fileId || file.status === 'scored') ? 'completed' : 'queued',
              files: batch.files.map((file) =>
                file.id === fileId
                  ? {
                      ...file,
                      status: 'scored',
                      score: file.score ? Math.min(96, file.score + 4) : 72,
                    }
                  : file,
              ),
            }
          : batch,
      ),
    );
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
          <div className="inline-grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab('quality')}
              className={['flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition', activeTab === 'quality' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
            >
              <FiClipboard className="h-4 w-4" />
              Quality Check
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={['flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition', activeTab === 'templates' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
            >
              <FiLayers className="h-4 w-4" />
              Templates
            </button>
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
                onUploadFiles={uploadFilesToBatch}
                onReEvaluateFile={(batchId, fileId) => void reEvaluateFile(batchId, fileId)}
                onDeleteFile={deleteFileFromBatch}
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
              <p className="mt-1 text-sm text-muted-foreground">ตั้งชื่อชุดงานและเลือกเกณฑ์ประเมินก่อนสร้างคิว</p>
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
              <p className="text-sm font-semibold">{sourceType === 'audio' ? 'ตัวอย่างชุดไฟล์เสียง' : 'ตัวอย่างชุดเอกสาร'}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {sourceType === 'audio'
                  ? 'ระบบจะสร้างคิวตัวอย่าง 3 ไฟล์เสียง: webm, m4a, wav'
                  : 'ระบบจะสร้างคิวตัวอย่าง 4 เอกสาร: md, docx, doc, txt'}
              </p>
              {sourceType === 'document' && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  รองรับไฟล์ข้อความและเอกสาร Word สำหรับตรวจสอบพร้อมกันหลายไฟล์ เช่นเดียวกับไฟล์เสียง
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
          <p className="mt-1 text-sm text-muted-foreground">สร้างชุดงานแล้วเข้าไปดูผลการประเมินรายไฟล์</p>
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
                      กด New Batch เพื่อเลือกไฟล์และเกณฑ์ประเมิน แล้วเริ่มตรวจสอบคุณภาพ
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
  onUploadFiles,
  onReEvaluateFile,
  onDeleteFile,
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
  onUploadFiles: (batchId: string, files: BatchFile[]) => void;
  onReEvaluateFile: (batchId: string, fileId: string) => void;
  onDeleteFile: (batchId: string, fileId: string) => void;
  onSelectFile: (fileId: string) => void;
  selectedEvidenceItemId?: string;
  onSelectEvidenceItem: (itemId: string) => void;
}) {
  const selectedFile = batch.files.find((file) => file.id === selectedFileId) ?? batch.files[0];
  const hasResult = selectedFile?.status === 'scored';
  const isRunning = runningBatchId === batch.id;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reviewFile, setReviewFile] = useState<BatchFile | null>(null);

  const openFile = (file: BatchFile) => {
    onSelectFile(file.id);
    if (file.sourceType === 'audio' && file.status === 'scored') {
      setReviewFile(file);
    }
  };

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
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setReportModalOpen(true)}>
              <FiDownload className="h-4 w-4" />
              Report
            </Button>
            <Button variant="secondary" onClick={() => setUploadModalOpen(true)}>
              <FiUploadCloud className="h-4 w-4" />
              Upload files
            </Button>
            <Button onClick={() => onRun(batch.id)} disabled={isRunning || batch.status === 'completed'}>
              <FiPlay className="h-4 w-4" />
              {isRunning ? 'กำลังประมวลผล' : batch.status === 'completed' ? 'Completed' : 'Run batch'}
            </Button>
          </div>
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
              <p className="mt-1 text-sm text-muted-foreground">ระบบจะตรวจสอบทีละไฟล์ตามลำดับ</p>
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
                      <th className="px-4 py-3 text-right font-semibold">Action</th>
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
                        onClick={() => openFile(file)}
                      >
                        <td className="px-4 py-4 font-medium">{file.name}</td>
                        <td className="px-4 py-4 text-muted-foreground">{file.sourceType}</td>
                        <td className="px-4 py-4">
                          <Badge tone={file.status === 'scored' ? 'success' : file.status === 'processing' ? 'warning' : 'muted'}>
                            {file.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-semibold">{file.score ? `${file.score}/100` : '-'}</td>
                        <td className="px-4 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                          <QualityFileActionMenu
                            file={file}
                            onReEvaluate={() => onReEvaluateFile(batch.id, file.id)}
                            onDelete={() => onDeleteFile(batch.id, file.id)}
                          />
                        </td>
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
                  <p className="mt-2 text-sm text-muted-foreground">กด Run batch แล้วระบบจะตรวจสอบไฟล์ตามลำดับ</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="grid content-start gap-5 xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
          <BatchOverviewPanel batch={batch} completedFiles={completedFiles} selectedFile={selectedFile} />
          {hasResult && (
            <EvidenceDrawer
              scorecard={{ ...mockScorecard, totalScore: selectedFile.score ?? mockScorecard.totalScore }}
              selectedItemId={selectedEvidenceItemId}
            />
          )}
        </aside>
      </div>

      {uploadModalOpen && (
        <QualityBatchUploadModal
          batch={batch}
          onClose={() => setUploadModalOpen(false)}
          onUpload={(files) => {
            onUploadFiles(batch.id, files);
            setUploadModalOpen(false);
          }}
        />
      )}

      {reportModalOpen && (
        <QualityBatchReportModal
          batch={batch}
          completedFiles={completedFiles}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {reviewFile && <QualityFileAsrReviewModal file={reviewFile} onClose={() => setReviewFile(null)} />}
    </div>
  );
}

function QualityFileActionMenu({
  file,
  onReEvaluate,
  onDelete,
}: {
  file: BatchFile;
  onReEvaluate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={`Open actions for ${file.name}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-border bg-card p-1 text-left shadow-panel">
          <button
            type="button"
            onClick={() => {
              onReEvaluate();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <FiRefreshCw className="h-4 w-4 text-primary" />
            Re-evaluate
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function QualityFileAsrReviewModal({ file, onClose }: { file: BatchFile; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState(() =>
    buildQualityFileTranscript(file).map((segment) => ({
      ...segment,
      originalText: segment.text,
    })),
  );

  const updateSegmentText = (segmentId: number, text: string) => {
    setTranscript((segments) => segments.map((segment) => (segment.id === segmentId ? { ...segment, text } : segment)));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/28 p-3 backdrop-blur-sm sm:p-4" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quality-asr-review-title"
          className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">รีวิว Transcript เสียง</p>
              <h2 id="quality-asr-review-title" className="mt-1 truncate text-xl font-semibold">
                {file.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Quality batch file · Botnoi ASR · score {file.score ? `${file.score}/100` : '-'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close ASR review"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid gap-4">
              <div className="rounded-lg border border-border bg-white p-4">
                <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlaying((value) => !value)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={playing ? 'Pause audio' : 'Play audio'}
                    >
                      {playing ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground transition hover:bg-secondary/80"
                      aria-label="Volume"
                    >
                      <FiVolume2 className="h-5 w-5" />
                    </button>
                    <Badge tone={playing ? 'success' : 'muted'}>{playing ? 'playing' : 'paused'}</Badge>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-center gap-1 text-sm font-semibold text-primary">
                      <span>04:25</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">12:48</span>
                    </div>
                    <div className="relative h-24 rounded-lg bg-muted/70 px-3 py-3">
                      <div className="absolute left-[32%] top-0 h-full w-0.5 bg-primary">
                        <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
                      </div>
                      <QualityWaveformLane speaker="Sales" color="primary" />
                      <QualityWaveformLane speaker="Customer" color="warning" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-11 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground">
                <FiSearch className="h-4 w-4" />
                <span className="truncate">Search transcript</span>
              </div>

              <div className="grid gap-3">
                {transcript.map((segment) => {
                  const edited = segment.text.trim() !== segment.originalText.trim();

                  return (
                    <div
                      key={segment.id}
                      className={[
                        'rounded-lg border p-4 transition',
                        edited ? 'border-warning/50 bg-warning/10' : 'border-border bg-card',
                      ].join(' ')}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={['font-semibold', segment.speaker === 'Sales' ? 'text-primary' : 'text-warning'].join(' ')}>
                              {segment.speaker}
                            </p>
                            {edited && (
                              <Badge tone="warning">
                                <FiEdit2 className="mr-1 h-3.5 w-3.5" />
                                edited
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {segment.id}
                            <br />
                            {segment.start} --&gt; {segment.end}
                          </p>
                        </div>
                        <Button type="button" variant="secondary" className="h-9 px-3">
                          <FiPlay className="h-4 w-4" />
                          Play segment
                        </Button>
                      </div>
                      <label className="mt-3 block text-sm font-semibold text-foreground" htmlFor={`quality-asr-segment-${file.id}-${segment.id}`}>
                        ASR text
                      </label>
                      <textarea
                        id={`quality-asr-segment-${file.id}-${segment.id}`}
                        value={segment.text}
                        onChange={(event) => updateSegmentText(segment.id, event.target.value)}
                        className="mt-2 min-h-[88px] w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                        aria-label={`${segment.speaker} transcript segment ${segment.id}`}
                      />
                      {edited && <p className="mt-2 text-xs font-medium text-warning">ข้อความนี้ถูกแก้จาก ASR เดิม</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function QualityWaveformLane({ speaker, color }: { speaker: string; color: 'primary' | 'warning' }) {
  const bars = color === 'primary' ? [9, 16, 26, 18, 10, 22, 30, 12, 18] : [12, 24, 10, 28, 14, 18, 26, 12, 24];
  const barClass = color === 'primary' ? 'bg-primary' : 'bg-warning';

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 first:mb-3">
      <p className={['truncate text-xs font-semibold', color === 'primary' ? 'text-primary' : 'text-warning'].join(' ')}>{speaker}</p>
      <div className="flex h-5 min-w-0 items-center gap-2 rounded-full bg-card/80 px-2">
        {bars.map((width, index) => (
          <span key={`${speaker}-${index}`} className={['h-2 rounded-full', barClass].join(' ')} style={{ width: `${width}%` }} />
        ))}
      </div>
    </div>
  );
}

function buildQualityFileTranscript(file: BatchFile): QualityTranscriptSegment[] {
  const baseTranscript: QualityTranscriptSegment[] = [
    {
      id: 1,
      start: '00:00:01,000',
      end: '00:00:07,800',
      speaker: 'Sales',
      text: 'สวัสดีครับ ผมพิมจาก SaleSync โทรมาเรื่องโปร Q2 สำหรับร้านค้า SME ไม่ทราบว่าสะดวกคุยสั้น ๆ ไหมครับ',
    },
    {
      id: 2,
      start: '00:00:08,200',
      end: '00:00:14,600',
      speaker: 'Customer',
      text: 'ได้ครับ แต่ผมอยากรู้ก่อนว่าโปรนี้ใช้กับร้านค้ารายย่อยแบบผมได้ไหม',
    },
    {
      id: 3,
      start: '00:00:15,000',
      end: '00:00:27,400',
      speaker: 'Sales',
      text: 'ใช้ได้ถ้าเข้าเกณฑ์ SME และเปิดบัญชีใหม่ตามเงื่อนไขแคมเปญ ต้องแจ้งวันหมดอายุ ยอดขั้นต่ำ และข้อจำกัดสิทธิ์ให้ครบครับ',
    },
    {
      id: 4,
      start: '00:00:28,000',
      end: '00:00:39,300',
      speaker: 'Customer',
      text: 'แล้วถ้าผมใช้โปรนี้จะช่วยเพิ่มยอดขายได้แน่นอนไหม',
    },
    {
      id: 5,
      start: '00:00:40,000',
      end: '00:00:55,000',
      speaker: 'Sales',
      text: 'ผมไม่สามารถรับประกันยอดขายได้ครับ แต่ช่วยลดต้นทุนช่วงเริ่มต้นได้ เดี๋ยวผมขอถาม pain point ปัจจุบันก่อนว่าเสียต้นทุนสูงจากส่วนไหน',
    },
  ];

  if (file.score && file.score < 70) {
    return baseTranscript.map((segment) =>
      segment.id === 5
        ? {
            ...segment,
            text: 'โปรนี้ช่วยลดต้นทุนช่วงเริ่มต้นได้ครับ เดี๋ยวผมส่งรายละเอียดให้ดูเพิ่มเติม',
          }
        : segment,
    );
  }

  return baseTranscript;
}

function QualityBatchReportModal({
  batch,
  completedFiles,
  onClose,
}: {
  batch: ReviewBatch;
  completedFiles: number;
  onClose: () => void;
}) {
  const scoredFiles = batch.files.filter((file) => file.status === 'scored' && typeof file.score === 'number');
  const averageScore = scoredFiles.length > 0
    ? Math.round(scoredFiles.reduce((sum, file) => sum + (file.score ?? 0), 0) / scoredFiles.length)
    : 0;
  const queuedFiles = batch.files.filter((file) => file.status === 'queued').length;
  const failedFiles = batch.files.filter((file) => file.status === 'failed').length;
  const progress = Math.round((completedFiles / Math.max(batch.files.length, 1)) * 100);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'md' | 'csv'>('pdf');
  const exportOptions = [
    {
      id: 'pdf' as const,
      label: 'PDF report',
      detail: 'executive summary, evidence, recommendation',
      fileName: `quality-report-${batch.id}.pdf`,
    },
    {
      id: 'md' as const,
      label: 'Markdown handoff',
      detail: 'editable notes for sales ops or playbook owner',
      fileName: `quality-report-${batch.id}.md`,
    },
    {
      id: 'csv' as const,
      label: 'CSV score table',
      detail: 'file-level scores for spreadsheet analysis',
      fileName: `quality-report-${batch.id}.csv`,
    },
  ];
  const selectedExport = exportOptions.find((option) => option.id === exportFormat) ?? exportOptions[0];

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quality-report-dialog-title"
          className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quality report</p>
              <h2 id="quality-report-dialog-title" className="mt-1 text-base font-semibold">
                Export evaluation report
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                รวมผลประเมินทุกไฟล์ในชุดงาน พร้อมคะแนน สรุปหลักฐาน และสถานะแต่ละไฟล์
              </p>
            </div>
            <button
              type="button"
              aria-label="Close report dialog"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 overflow-y-auto p-5">
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{batch.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{batch.guidance}</p>
                </div>
                <Badge tone={batch.status === 'completed' ? 'success' : batch.status === 'processing' ? 'warning' : 'muted'}>
                  {batch.status}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <BatchMetric label="Overall score" value={scoredFiles.length > 0 ? `${averageScore}/100` : '-'} />
                <BatchMetric label="Scored" value={`${completedFiles}/${batch.files.length}`} />
                <BatchMetric label="Queued" value={`${queuedFiles}`} />
                <BatchMetric label="Failed" value={`${failedFiles}`} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{progress}% complete before export</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-lg border border-border bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FiClipboard className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Report contents</p>
                </div>
                <div className="grid gap-2 text-sm">
                  {[
                    'Batch summary and file-level status',
                    'Scorecard result by template section',
                    'Evidence highlights and risk flags',
                    'Transcript or document snippet references',
                    'Manager recommendation and follow-up actions',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                      <FiClipboard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid content-start gap-3">
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Export format</p>
                  <div className="mt-3 grid gap-2">
                    {exportOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setExportFormat(option.id)}
                        className={[
                          'rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          exportFormat === option.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card hover:bg-secondary',
                        ].join(' ')}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{option.label}</span>
                          {exportFormat === option.id ? <FiCheck className="h-4 w-4 text-primary" /> : null}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">ไฟล์ที่จะถูกดาวน์โหลด</p>
                  <p className="mt-2 break-all text-sm font-semibold">{selectedExport.fileName}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {exportFormat === 'pdf'
                      ? 'เหมาะสำหรับส่งให้ manager หรือ stakeholder อ่านภาพรวม'
                      : exportFormat === 'md'
                        ? 'เหมาะสำหรับส่งต่อให้ทีม sales ops/playbook owner แก้ไขต่อ'
                        : 'เหมาะสำหรับเปิดต่อใน spreadsheet หรือ BI'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Continue working</p>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-muted p-3">Attach report to coaching task</div>
                    <div className="rounded-lg bg-muted p-3">Send Markdown to Playbook update backlog</div>
                    <div className="rounded-lg bg-muted p-3">Export CSV for team score review</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white">
              <div className="border-b border-border p-4">
                <p className="text-sm font-semibold">Files included</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
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
                      <tr key={file.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{file.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{file.sourceType}</td>
                        <td className="px-4 py-3">
                          <Badge tone={file.status === 'scored' ? 'success' : file.status === 'processing' ? 'warning' : 'muted'}>
                            {file.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold">{file.score ? `${file.score}/100` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="secondary">
              <FiFileText className="h-4 w-4" />
              Save as {exportFormat.toUpperCase()}
            </Button>
            <Button>
              <FiDownload className="h-4 w-4" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function QualityBatchUploadModal({
  batch,
  onClose,
  onUpload,
}: {
  batch: ReviewBatch;
  onClose: () => void;
  onUpload: (files: BatchFile[]) => void;
}) {
  const [uploadMode, setUploadMode] = useState<'audio' | 'document' | 'mixed'>(batch.sourceType);
  const mockFiles = buildQualityUploadFiles(uploadMode);
  const audioCount = mockFiles.filter((file) => file.sourceType === 'audio').length;
  const documentCount = mockFiles.filter((file) => file.sourceType === 'document').length;

  const handleUpload = () => {
    const stamp = Date.now();
    onUpload(
      mockFiles.map((file, index) => ({
        ...file,
        id: `file_${stamp}_${index + 1}`,
        status: 'queued',
      })),
    );
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quality-upload-dialog-title"
          className="grid max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quality batch upload</p>
              <h2 id="quality-upload-dialog-title" className="mt-1 text-base font-semibold">
                Upload files to batch
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                เพิ่มหลายไฟล์เข้า batch เดิม แล้วให้ระบบ process ตาม guidance template ที่เลือกไว้
              </p>
            </div>
            <button
              type="button"
              aria-label="Close upload dialog"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <BatchMetric label="Destination batch" value={batch.name} />
              <BatchMetric label="Template" value={batch.guidance} />
              <BatchMetric label="Current files" value={`${batch.files.length}`} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <UploadModeButton active={uploadMode === 'audio'} onClick={() => setUploadMode('audio')} icon={<FiMic />}>
                Audio
              </UploadModeButton>
              <UploadModeButton active={uploadMode === 'document'} onClick={() => setUploadMode('document')} icon={<FiFileText />}>
                Documents
              </UploadModeButton>
              <UploadModeButton active={uploadMode === 'mixed'} onClick={() => setUploadMode('mixed')} icon={<FiLayers />}>
                Mixed
              </UploadModeButton>
            </div>

            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiUploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">Drop files here or choose source</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                รองรับ mp3, wav, m4a, webm, pdf, md, doc, docx และ txt สำหรับ multi upload ใน batch เดียว
              </p>
              <Button className="mt-4" variant="secondary">
                <FiUploadCloud className="h-4 w-4" />
                Choose files
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">ไฟล์ที่รอส่งเข้าระบบ</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mockFiles.length} files ready · {audioCount} audio · {documentCount} documents
                  </p>
                </div>
                <Badge tone="muted">queued after upload</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                {mockFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        {file.sourceType === 'audio' ? <FiMic className="h-4 w-4" /> : <FiFileText className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.sourceType} review source</p>
                      </div>
                    </div>
                    <Badge tone="muted">ready</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <FiPlus className="h-4 w-4" />
              Add {mockFiles.length} files
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function UploadModeButton({
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
        'flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span className="text-base">{icon}</span>
      {children}
    </button>
  );
}

function buildQualityUploadFiles(mode: 'audio' | 'document' | 'mixed'): BatchFile[] {
  const audioFiles: BatchFile[] = [
    { id: 'upload-audio-1', name: 'mock-call-04.webm', sourceType: 'audio', status: 'queued' },
    { id: 'upload-audio-2', name: 'follow-up-pitch-05.m4a', sourceType: 'audio', status: 'queued' },
  ];
  const documentFiles: BatchFile[] = [
    { id: 'upload-doc-1', name: 'q2-promo-faq.md', sourceType: 'document', status: 'queued' },
    { id: 'upload-doc-2', name: 'landing-copy-review.docx', sourceType: 'document', status: 'queued' },
    { id: 'upload-doc-3', name: 'prohibited-claim-check.txt', sourceType: 'document', status: 'queued' },
  ];

  if (mode === 'audio') return audioFiles;
  if (mode === 'document') return documentFiles;
  return [audioFiles[0], documentFiles[0], documentFiles[1]];
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
  const progress = Math.round((completedFiles / Math.max(batch.files.length, 1)) * 100);
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
        <p className="mt-1 text-sm text-muted-foreground">ภาพรวมคะแนนและความคืบหน้าของชุดงานนี้</p>
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
