import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClipboard,
  FiEdit2,
  FiLayers,
  FiMic,
  FiPause,
  FiPlay,
  FiPlus,
  FiSearch,
  FiSquare,
  FiUploadCloud,
  FiVolume2,
  FiX,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { buildPath, routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';

type RecordingMode = 'browser_recording' | 'audio_upload';
type RecordingTab = 'batches' | 'rubrics';
type RubricTab = 'training' | 'validation';
type BatchStatus = 'queued' | 'processing' | 'completed' | 'needs_coaching';

export type TrainingRubric = {
  id: string;
  name: string;
  scenario: string;
  version: string;
  sections: number;
  status: 'published' | 'draft';
  focus: string;
};

type Attempt = {
  id: string;
  label: string;
  source: string;
  recordedBy: string;
  mode: RecordingMode;
  score: number | null;
  status: 'draft' | 'queued' | 'processing' | 'scored';
  focus: string;
  date: string;
};

type RecordingBatch = {
  id: string;
  name: string;
  createdBy: string;
  rubricId: string;
  mode: RecordingMode;
  status: BatchStatus;
  createdAt: string;
  attempts: Attempt[];
};

type TranscriptSegment = {
  id: number;
  start: string;
  end: string;
  speaker: 'Sales' | 'Customer';
  text: string;
};

const recordingMeterBarCount = 48;
const idleRecordingMeterBars = Array.from({ length: recordingMeterBarCount }, (_, index) => 8 + (index % 5) * 2);

export const trainingRubrics: TrainingRubric[] = [
  {
    id: 'rrb-pitch-sme-v1',
    name: 'Pitch Practice - SME',
    scenario: 'promotion_pitch',
    version: 'v1',
    sections: 5,
    status: 'published',
    focus: 'Opening, pain point, value, objection, closing',
  },
  {
    id: 'rrb-objection-v1',
    name: 'Objection Handling - Price',
    scenario: 'price_objection',
    version: 'v1',
    sections: 4,
    status: 'published',
    focus: 'Clarify concern, budget truth, option framing',
  },
  {
    id: 'rrb-product-demo-v1',
    name: 'Product Demo - Non Tech',
    scenario: 'product_demo',
    version: 'v1',
    sections: 4,
    status: 'draft',
    focus: 'Simple language, use case mapping, next step',
  },
];

const initialBatches: RecordingBatch[] = [
  {
    id: 'rrb-001',
    name: 'Pitch โปร Q2 สำหรับ SME',
    createdBy: 'Pim K.',
    rubricId: 'rrb-pitch-sme-v1',
    mode: 'browser_recording',
    status: 'completed',
    createdAt: '2026-05-16 10:42',
    attempts: [
      {
        id: 'att-001',
        label: 'Attempt 1',
        source: 'recorded-in-browser.webm',
        recordedBy: 'Pim K.',
        mode: 'browser_recording',
        score: 62,
        status: 'scored',
        focus: 'ยังถาม pain point น้อย และปิด next step ไม่ชัด',
        date: '10:42',
      },
      {
        id: 'att-002',
        label: 'Attempt 2',
        source: 'recorded-in-browser-2.webm',
        recordedBy: 'Pim K.',
        mode: 'browser_recording',
        score: 74,
        status: 'scored',
        focus: 'เริ่มจับ objection ได้ดีขึ้น แต่ยังใช้ศัพท์เทคนิคเยอะ',
        date: '11:08',
      },
      {
        id: 'att-003',
        label: 'Attempt 3',
        source: 'recorded-in-browser-3.webm',
        recordedBy: 'Pim K.',
        mode: 'browser_recording',
        score: 82,
        status: 'scored',
        focus: 'ถาม pain point ครบและปิด next step ได้ชัด',
        date: '11:31',
      },
    ],
  },
  {
    id: 'rrb-002',
    name: 'รับมือ objection เรื่องราคา',
    createdBy: 'Nara S.',
    rubricId: 'rrb-objection-v1',
    mode: 'audio_upload',
    status: 'needs_coaching',
    createdAt: '2026-05-15 15:20',
    attempts: [
      {
        id: 'att-004',
        label: 'Attempt 1',
        source: 'price-objection-01.m4a',
        recordedBy: 'Nara S.',
        mode: 'audio_upload',
        score: 58,
        status: 'scored',
        focus: 'ตอบลดราคาเร็วเกินไป ยังไม่ถาม budget truth',
        date: '15:20',
      },
      {
        id: 'att-005',
        label: 'Attempt 2',
        source: 'price-objection-02.wav',
        recordedBy: 'Nara S.',
        mode: 'audio_upload',
        score: 66,
        status: 'scored',
        focus: 'ดีขึ้นด้าน framing แต่ยังไม่มีทางเลือกที่ชัด',
        date: '16:04',
      },
    ],
  },
  {
    id: 'rrb-003',
    name: 'Product demo ให้ลูกค้า non-tech',
    createdBy: 'Pim K.',
    rubricId: 'rrb-product-demo-v1',
    mode: 'audio_upload',
    status: 'queued',
    createdAt: '2026-05-16 13:15',
    attempts: [
      {
        id: 'att-006',
        label: 'Attempt 1',
        source: 'demo-non-tech-01.webm',
        recordedBy: 'Pim K.',
        mode: 'audio_upload',
        score: null,
        status: 'queued',
        focus: 'รอประเมินด้วย draft rubric',
        date: '13:15',
      },
    ],
  },
];

const validationTests = [
  { id: 'rtv-opening-objective', test: 'Opening and objective', rubric: 'Pitch Practice - SME', risk: 'medium', status: 'ready', score: '9/10' },
  { id: 'rtv-pain-depth', test: 'Pain point depth', rubric: 'Pitch Practice - SME', risk: 'high', status: 'needs review', score: '12/20' },
  { id: 'rtv-overclaim', test: 'No overclaim language', rubric: 'Objection Handling - Price', risk: 'critical', status: 'ready', score: '15/15' },
];

export function RecordingReviewPage() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [tab, setTab] = useState<RecordingTab>('batches');
  const [batches, setBatches] = useState(initialBatches);
  const [modalOpen, setModalOpen] = useState(false);
  const selectedBatch = batches.find((batch) => batch.id === batchId);

  if (batchId && selectedBatch) {
    return (
      <RecordingBatchDetail
        batch={selectedBatch}
        onAddAttempt={(mode) => addAttemptToBatch(selectedBatch.id, mode)}
        onRename={(name) => renameBatch(selectedBatch.id, name)}
        onBack={() => navigate(routes.recordingReview)}
      />
    );
  }

  const completedAttempts = batches.flatMap((batch) => batch.attempts).filter((attempt) => attempt.score !== null);
  const averageScore = Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / completedAttempts.length);
  const completedBatches = batches.filter((batch) => batch.status === 'completed').length;

  function createBatch(payload: { name: string; rubricId: string; mode: RecordingMode }) {
    const nextBatch: RecordingBatch = {
      id: `rrb-00${batches.length + 1}`,
      name: payload.name,
      createdBy: 'Pim K.',
      rubricId: payload.rubricId,
      mode: payload.mode,
      status: 'queued',
      createdAt: '2026-05-16 17:40',
      attempts: [
        {
          id: `att-00${batches.length + 7}`,
          label: 'Attempt 1',
          source: payload.mode === 'browser_recording' ? 'browser-recording-draft.webm' : 'uploaded-practice-01.m4a',
          recordedBy: 'Pim K.',
          mode: payload.mode,
          score: null,
          status: 'queued',
          focus: 'รอประเมินด้วย training rubric',
          date: '17:40',
        },
      ],
    };

    setBatches((items) => [nextBatch, ...items]);
    setModalOpen(false);
    navigate(buildPath.recordingReviewBatch({ batchId: nextBatch.id }));
  }

  function addAttemptToBatch(batchId: string, mode: RecordingMode, queueStatus: 'draft' | 'queued' = 'queued') {
    setBatches((items) =>
      items.map((batch) => {
        if (batch.id !== batchId) {
          return batch;
        }

        const attemptNumber = batch.attempts.length + 1;
        const nextAttempt: Attempt = {
          id: `att-${batch.id}-${attemptNumber}`,
          label: `Attempt ${attemptNumber}`,
          source: mode === 'browser_recording' ? `recorded-in-browser-${attemptNumber}.webm` : `uploaded-practice-${attemptNumber}.m4a`,
          recordedBy: 'Pim K.',
          mode,
          score: null,
          status: queueStatus,
          focus:
            queueStatus === 'draft'
              ? 'บันทึกเสียงแล้ว แต่ยังไม่ส่งให้ระบบประเมิน'
              : mode === 'browser_recording'
                ? 'รออัดเสียงและประเมิน attempt ใหม่'
                : 'รออัปโหลดเสียงและประเมิน attempt ใหม่',
          date: '19:35',
        };

        return {
          ...batch,
          mode,
          status: queueStatus === 'queued' ? 'queued' : batch.status,
          attempts: [...batch.attempts, nextAttempt],
        };
      }),
    );
  }

  function renameBatch(batchId: string, name: string) {
    setBatches((items) =>
      items.map((batch) => {
        if (batch.id !== batchId) {
          return batch;
        }

        return {
          ...batch,
          name,
        };
      }),
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border bg-card px-5 py-5 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Recording Review</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              ฝึก pitch/mock call ด้วยการอัดเสียงใน browser หรืออัปโหลดไฟล์เสียง แล้วประเมินเป็น batch เพื่อดูพัฒนาการครั้งที่ 1, 2, 3
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setModalOpen(true)}>
              <FiPlus className="h-4 w-4" />
              New batch
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid w-full max-w-full gap-4 p-4 lg:p-6">
        <div className="grid gap-2 md:grid-cols-4">
          <Metric label="Batches" value={`${batches.length}`} tone="default" />
          <Metric label="Avg score" value={`${averageScore}/100`} tone="warning" />
          <Metric label="Completed" value={`${completedBatches}`} tone="success" />
          <Metric label="Needs coaching" value={`${batches.filter((batch) => batch.status === 'needs_coaching').length}`} tone="danger" />
        </div>

        <div className="inline-grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
          <SegmentButton compact active={tab === 'batches'} onClick={() => setTab('batches')} icon={<FiClipboard className="h-4 w-4" />}>
            Practice Batches
          </SegmentButton>
          <SegmentButton compact active={tab === 'rubrics'} onClick={() => setTab('rubrics')} icon={<FiLayers className="h-4 w-4" />}>
            Rubric Management
          </SegmentButton>
        </div>

        {tab === 'batches' ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Review Batches</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">สร้าง batch แล้วเก็บ attempt หลายครั้งเพื่อเทียบพัฒนาการ</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Batch</th>
                        <th className="px-5 py-3">Created by</th>
                        <th className="px-5 py-3">Input</th>
                        <th className="px-5 py-3">Rubric</th>
                        <th className="px-5 py-3">Attempts</th>
                        <th className="px-5 py-3">Score</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((batch) => {
                        const rubric = trainingRubrics.find((item) => item.id === batch.rubricId);
                        const scored = batch.attempts.filter((attempt) => attempt.score !== null);
                        const lastScore = scored.at(-1)?.score;

                        return (
                          <tr
                            key={batch.id}
                            className="cursor-pointer border-t border-border transition hover:bg-muted/60"
                            onClick={() => navigate(buildPath.recordingReviewBatch({ batchId: batch.id }))}
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-foreground">{batch.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{batch.createdAt}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold">{batch.createdBy}</p>
                              <p className="mt-1 text-xs text-muted-foreground">batch owner</p>
                            </td>
                            <td className="px-5 py-4">{modeLabel(batch.mode)}</td>
                            <td className="px-5 py-4">{rubric?.name ?? '-'}</td>
                            <td className="px-5 py-4">{batch.attempts.length}</td>
                            <td className="px-5 py-4 font-semibold">{lastScore ? `${lastScore}/100` : '-'}</td>
                            <td className="px-5 py-4">
                              <Badge tone={statusTone(batch.status)}>{statusLabel(batch.status)}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <aside className="grid content-start gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">คะแนนล่าสุดของแต่ละ batch</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {batches.map((batch) => {
                    const score = batch.attempts.filter((attempt) => attempt.score !== null).at(-1)?.score ?? 0;
                    return <ProgressBar key={batch.id} label={batch.name} value={score} />;
                  })}
                </CardContent>
              </Card>
            </aside>
          </section>
        ) : (
          <RubricManagement />
        )}
        </div>
      </main>

      {modalOpen && <NewBatchModal onClose={() => setModalOpen(false)} onCreate={createBatch} />}
    </div>
  );
}

function RecordingBatchDetail({
  batch,
  onAddAttempt,
  onRename,
  onBack,
}: {
  batch: RecordingBatch;
  onAddAttempt: (mode: RecordingMode, queueStatus?: 'draft' | 'queued') => void;
  onRename: (name: string) => void;
  onBack: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const rubric = trainingRubrics.find((item) => item.id === batch.rubricId);
  const scoredAttempts = batch.attempts.filter((attempt) => attempt.score !== null);
  const firstScore = scoredAttempts[0]?.score ?? 0;
  const lastScore = scoredAttempts.at(-1)?.score ?? 0;
  const averageScore = scoredAttempts.length
    ? Math.round(scoredAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / scoredAttempts.length)
    : null;
  const improvement = lastScore - firstScore;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b border-border bg-card px-5 py-5 lg:px-8">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <FiArrowLeft className="h-4 w-4" />
          Back to batches
        </button>
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{batch.name}</h1>
              <button
                type="button"
                onClick={() => setRenameOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground transition hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Edit batch name"
                title="Edit batch name"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{rubric?.name} · {modeLabel(batch.mode)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setRecordModalOpen(true)}>
              <FiMic className="h-4 w-4" />
              Record attempt
            </Button>
            <Button variant="secondary" onClick={() => setUploadModalOpen(true)}>
              <FiUploadCloud className="h-4 w-4" />
              Upload audio
            </Button>
            <Button>
              <FiPlay className="h-4 w-4" />
              Run batch
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="grid w-full max-w-full gap-5 p-4 sm:p-5 lg:p-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid min-w-0 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Batch Summary</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">ระบบจะประเมินแต่ละครั้งตามเกณฑ์การฝึกที่เลือก</p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <SummaryBox label="Status" value={statusLabel(batch.status)} />
              <SummaryBox label="Attempts" value={`${batch.attempts.length}`} />
              <SummaryBox label="Average score" value={averageScore ? `${averageScore}/100` : '-'} />
              <SummaryBox label="Latest score" value={lastScore ? `${lastScore}/100` : '-'} />
              <SummaryBox label="Improvement" value={improvement > 0 ? `+${improvement}` : `${improvement}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attempts in Batch</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">คลิกแต่ละรอบเพื่อฟังเสียงและดู transcript</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Attempt</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Recorded by</th>
                      <th className="px-5 py-3">Mode</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Coaching Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.attempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="cursor-pointer border-t border-border transition hover:bg-muted/60"
                        onClick={() => setSelectedAttempt(attempt)}
                      >
                        <td className="px-5 py-4 font-semibold">{attempt.label}</td>
                        <td className="px-5 py-4">
                          <p>{attempt.source}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{attempt.date}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{attempt.recordedBy}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{attempt.mode === 'browser_recording' ? 'recorded' : 'uploaded'}</p>
                        </td>
                        <td className="px-5 py-4">{modeLabel(attempt.mode)}</td>
                        <td className="px-5 py-4">
                          <Badge tone={attemptStatusTone(attempt.status)}>{attemptStatusLabel(attempt.status)}</Badge>
                        </td>
                        <td className="px-5 py-4 font-semibold">{attempt.score ? `${attempt.score}/100` : '-'}</td>
                        <td className="px-5 py-4 text-muted-foreground">{attempt.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rubric Score Breakdown</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">คะแนนล่าสุดแยกตามหัวข้อในเกณฑ์การฝึก</p>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                ['Opening', 17, 20],
                ['Discovery', 18, 25],
                ['Value proposition', 20, 25],
                ['Objection handling', 15, 20],
                ['Closing next step', 12, 10],
              ].map(([label, score, max]) => (
                <div key={label} className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm font-semibold">{score}/{max}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (Number(score) / Number(max)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="grid min-w-0 content-start gap-5 lg:grid-cols-2 2xl:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Attempt Trend</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">ดูพัฒนาการของชุดงานนี้</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              {batch.attempts.map((attempt) => (
                <ProgressBar key={attempt.id} label={attempt.label} value={attempt.score ?? 0} />
              ))}
              <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
                {improvement > 0 ? `ดีขึ้น ${improvement} คะแนนจาก attempt แรก` : 'ยังไม่มีคะแนนพอสำหรับเทียบ progression'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Rubric</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <SummaryBox label="Rubric" value={rubric?.name ?? '-'} />
              <SummaryBox label="Version" value={rubric?.version ?? '-'} />
              <SummaryBox label="Sections" value={`${rubric?.sections ?? 0}`} />
              <p className="rounded-lg bg-muted p-3 leading-6 text-muted-foreground">{rubric?.focus}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
      </main>

      {renameOpen && (
        <RenameBatchModal
          initialName={batch.name}
          onClose={() => setRenameOpen(false)}
          onSave={(name) => {
            onRename(name);
            setRenameOpen(false);
          }}
        />
      )}
      {recordModalOpen && (
        <RecordAttemptModal
          onClose={() => setRecordModalOpen(false)}
          onSave={(queueStatus) => {
            onAddAttempt('browser_recording', queueStatus);
            setRecordModalOpen(false);
          }}
        />
      )}
      {uploadModalOpen && (
        <UploadAudioModal
          batch={batch}
          rubric={rubric}
          onClose={() => setUploadModalOpen(false)}
          onUpload={(files) => {
            onAddAttempt('audio_upload', 'queued');
            setUploadModalOpen(false);
            void files;
          }}
        />
      )}
      {selectedAttempt && <AttemptReviewModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} />}
    </div>
  );
}

function RenameBatchModal({
  initialName,
  onClose,
  onSave,
}: {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const trimmedName = name.trim();

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/28 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-batch-title"
          className="grid w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 id="rename-batch-title" className="text-xl font-semibold">
                Rename batch
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">แก้ชื่อ batch เพื่อให้ทีมแยก scenario หรือรอบฝึกได้ชัดขึ้น</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close rename modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">
            <Field label="Batch name">
              <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
            </Field>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!trimmedName} onClick={() => onSave(trimmedName)}>
              <FiEdit2 className="h-4 w-4" />
              Save name
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function UploadAudioModal({
  batch,
  rubric,
  onClose,
  onUpload,
}: {
  batch: RecordingBatch;
  rubric?: TrainingRubric;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const nextAttemptNumber = batch.attempts.length + 1;
  const queuedFiles = selectedFiles.map((file) => ({
    name: file.name,
    meta: `${getFileExtension(file.name)} · ${formatFileSize(file.size)} · ready`,
  }));
  const hasSelectedFiles = selectedFiles.length > 0;

  function addFiles(files: FileList | File[]) {
    setSelectedFiles(Array.from(files).filter(isSupportedAudioFile));
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/28 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-audio-title"
          className="grid w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recording upload</p>
              <h2 id="upload-audio-title" className="mt-1 text-xl font-semibold text-foreground">
                Upload audio to batch
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">เพิ่มไฟล์เสียงเข้าชุดงานนี้ แล้วรอผลประเมินตามเกณฑ์ที่เลือก</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close upload modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 p-5">
            <div
              className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center transition hover:border-primary/60 hover:bg-secondary/40"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.m4a,.webm"
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files ?? []);
                  event.currentTarget.value = '';
                }}
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                <FiUploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 font-semibold text-foreground">Drop audio files here or choose source</p>
              <p className="mt-1 text-sm text-muted-foreground">รองรับ mp3, wav, m4a, webm และจะเพิ่มเป็น attempt ใน batch นี้</p>
              <Button className="mt-4 h-9 px-4" type="button" onClick={() => inputRef.current?.click()}>
                <FiUploadCloud className="h-4 w-4" />
                Choose files
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryBox label="Destination batch" value={batch.name} />
              <SummaryBox label="Training rubric" value={rubric?.name ?? '-'} />
              <SummaryBox label="Next attempt" value={`Attempt ${nextAttemptNumber}`} />
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Upload queue</p>
                  <p className="mt-1 text-sm text-muted-foreground">ไฟล์ที่รอประเมินในรอบถัดไป</p>
                </div>
                <Badge>{selectedFiles.length} selected</Badge>
              </div>
              <div className="mt-4 grid gap-2">
                {hasSelectedFiles ? (
                  queuedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{file.meta}</p>
                      </div>
                      <Badge tone="success">queued</Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
                    ยังไม่มีไฟล์ที่เลือก กด Choose files หรือวางไฟล์ลงในพื้นที่ด้านบน
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!hasSelectedFiles} onClick={() => onUpload(selectedFiles)}>
              <FiPlus className="h-4 w-4" />
              Add to batch
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function isSupportedAudioFile(file: File) {
  const extension = getFileExtension(file.name);
  return file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'webm'].includes(extension);
}

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').at(-1)?.trim().toLowerCase();
  return extension && extension !== fileName.toLowerCase() ? extension : 'audio';
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RecordAttemptModal({ onClose, onSave }: { onClose: () => void; onSave: (queueStatus: 'draft' | 'queued') => void }) {
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/28 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-attempt-title"
          className="w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recording attempt</p>
              <h2 id="record-attempt-title" className="mt-1 text-sm font-semibold text-primary">
                {stopped ? 'Recording saved' : 'Recording'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
              aria-label="Close recorder"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[999px] bg-background px-8 py-9">
            <div className="absolute left-[48%] top-4 z-10 h-[calc(100%-2rem)] w-0.5 bg-primary">
              <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
            </div>
            <RecorderWaveform active={!paused && !stopped} />
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-4xl font-semibold leading-none tracking-tight text-foreground">00:00:00</div>
              <p className="mt-2 text-xs font-semibold text-primary">{stopped ? 'saved draft' : paused ? 'paused' : 'recording now'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                disabled={stopped}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {paused ? <FiPlay className="h-4 w-4" /> : <FiPause className="h-4 w-4" />}
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStopped(true);
                  setPaused(true);
                }}
                disabled={stopped}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FiSquare className="h-3.5 w-3.5 fill-current" />
                Stop
              </button>
            </div>
          </div>

          {stopped ? (
            <div className="mt-5 rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">บันทึกเสียงไว้แล้ว ต้องการส่งเข้า queue ตอนนี้ไหม?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                หากยังไม่พร้อม สามารถบันทึกเป็นร่างก่อน หรือยกเลิกการบันทึกนี้ได้
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="destructive" className="h-9 px-3" onClick={onClose}>
                  Discard
                </Button>
                <Button variant="secondary" className="h-9 px-3" onClick={() => onSave('draft')}>
                  Save draft
                </Button>
                <Button className="h-9 px-3" onClick={() => onSave('queued')}>
                  Send to queue
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              เริ่มบันทึกเสียงแล้ว กด Pause เพื่อหยุดชั่วคราว หรือ Stop เพื่อบันทึกก่อน แล้วค่อยเลือกว่าจะส่งให้ระบบประเมินหรือไม่
            </p>
          )}
        </div>
      </div>
    </Portal>
  );
}

function RecorderWaveform({ active }: { active: boolean }) {
  const [bars, setBars] = useState(idleRecordingMeterBars);
  const [meterState, setMeterState] = useState<'checking' | 'live' | 'silent' | 'paused' | 'blocked'>('checking');
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    if (!active) {
      setMeterState('paused');
      setBars(idleRecordingMeterBars);
      return undefined;
    }

    setMeterState('checking');

    async function startMeter() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMeterState('blocked');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);

        const samples = new Uint8Array(analyser.fftSize);

        const tick = () => {
          if (cancelled) {
            return;
          }

          analyser.getByteTimeDomainData(samples);
          let sum = 0;
          for (const value of samples) {
            const normalized = (value - 128) / 128;
            sum += normalized * normalized;
          }

          const rms = Math.sqrt(sum / samples.length);
          const level = Math.min(1, rms * 7);
          setMeterState(level > 0.035 ? 'live' : 'silent');
          setBars(
            Array.from({ length: recordingMeterBarCount }, (_, index) => {
              const sampleIndex = Math.min(samples.length - 1, Math.floor((index / recordingMeterBarCount) * samples.length));
              const sampleLevel = Math.abs(samples[sampleIndex] - 128) / 128;
              return Math.round(Math.max(8, Math.min(56, 8 + sampleLevel * 52 + level * 18)));
            }),
          );

          frameRef.current = window.requestAnimationFrame(tick);
        };

        tick();
      } catch {
        if (!cancelled) {
          setMeterState('blocked');
          setBars(idleRecordingMeterBars);
        }
      }
    }

    void startMeter();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      stream?.getTracks().forEach((track) => track.stop());
      void audioContext?.close();
    };
  }, [active]);

  const meterLabel = {
    checking: 'กำลังขอสิทธิ์ microphone',
    live: 'ไมค์กำลังรับเสียง',
    silent: 'เชื่อมต่อไมค์แล้ว · ยังไม่พบเสียงพูด',
    paused: 'ไมค์หยุดพักชั่วคราว',
    blocked: 'ยังไม่ได้รับสิทธิ์ microphone หรือไม่พบสัญญาณเสียง',
  }[meterState];
  const barClass = meterState === 'live' ? 'bg-primary' : meterState === 'blocked' ? 'bg-destructive/45' : 'bg-primary/45';

  return (
    <div className="grid gap-2">
      <div className="flex h-14 items-center gap-1.5">
        {bars.map((height, index) => (
          <span
            key={`recording-meter-${index}`}
            className={['w-0.5 rounded-full transition-[height,background-color] duration-100', barClass].join(' ')}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <p className={['text-xs font-semibold', meterState === 'blocked' ? 'text-destructive' : 'text-primary'].join(' ')}>{meterLabel}</p>
    </div>
  );
}

function AttemptReviewModal({ attempt, onClose }: { attempt: Attempt; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState(() =>
    buildAttemptTranscript(attempt).map((segment) => ({
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
          aria-labelledby="attempt-review-title"
          className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">รีวิว Transcript เสียง</p>
              <h2 id="attempt-review-title" className="mt-1 truncate text-xl font-semibold">
                {attempt.label} · {attempt.source}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {attempt.recordedBy} · {modeLabel(attempt.mode)} · score {attempt.score ? `${attempt.score}/100` : '-'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close attempt review"
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
                      <WaveformLane speaker="Sales" color="primary" />
                      <WaveformLane speaker="Customer" color="warning" />
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
                      <label className="mt-3 block text-sm font-semibold text-foreground" htmlFor={`asr-segment-${attempt.id}-${segment.id}`}>
                        ASR text
                      </label>
                      <textarea
                        id={`asr-segment-${attempt.id}-${segment.id}`}
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

function WaveformLane({ speaker, color }: { speaker: string; color: 'primary' | 'warning' }) {
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

function buildAttemptTranscript(attempt: Attempt): TranscriptSegment[] {
  const pitchTranscript: TranscriptSegment[] = [
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

  if (attempt.score && attempt.score < 70) {
    return pitchTranscript.map((segment) =>
      segment.id === 5
        ? {
            ...segment,
            text: 'โปรนี้ช่วยลดต้นทุนช่วงเริ่มต้นได้ครับ เดี๋ยวผมส่งรายละเอียดให้ดูเพิ่มเติม',
          }
        : segment,
    );
  }

  return pitchTranscript;
}

function RubricManagement() {
  const navigate = useNavigate();
  const [rubricTab, setRubricTab] = useState<RubricTab>('training');

  return (
    <section className="grid gap-5">
      <div className="inline-flex w-fit rounded-lg border border-border bg-card p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setRubricTab('training')}
          className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
            rubricTab === 'training' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-pressed={rubricTab === 'training'}
        >
          <FiLayers className="h-4 w-4" />
          Training Rubrics
        </button>
        <button
          type="button"
          onClick={() => setRubricTab('validation')}
          className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
            rubricTab === 'validation' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-pressed={rubricTab === 'validation'}
        >
          <FiCheckCircle className="h-4 w-4" />
          Rubric Validation
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{rubricTab === 'training' ? 'Training Rubrics' : 'Rubric Validation Tests'}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {rubricTab === 'training'
              ? 'คลิก rubric เพื่อเปิดหน้าแก้ไข training rubric โดยตรง'
              : 'ชุดทดสอบก่อนนำเกณฑ์ไปใช้งานจริง'}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {rubricTab === 'training' ? (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Rubric</th>
                    <th className="px-5 py-3">Scenario</th>
                    <th className="px-5 py-3">Version</th>
                    <th className="px-5 py-3">Sections</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingRubrics.map((rubric) => (
                    <tr
                      key={rubric.id}
                      className="cursor-pointer border-t border-border transition hover:bg-muted/60"
                      onClick={() => navigate(buildPath.trainingRubricDetail({ rubricId: rubric.id }))}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{rubric.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{rubric.focus}</p>
                      </td>
                      <td className="px-5 py-4">{rubric.scenario}</td>
                      <td className="px-5 py-4 font-semibold">{rubric.version}</td>
                      <td className="px-5 py-4">{rubric.sections}</td>
                      <td className="px-5 py-4">
                        <Badge tone={rubric.status === 'published' ? 'success' : 'muted'}>{rubric.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Test</th>
                    <th className="px-5 py-3">Rubric</th>
                    <th className="px-5 py-3">Risk</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {validationTests.map((test) => (
                    <tr key={test.id} className="border-t border-border hover:bg-muted/60">
                      <td className="px-5 py-4 font-semibold">{test.test}</td>
                      <td className="px-5 py-4">{test.rubric}</td>
                      <td className="px-5 py-4">
                        <Badge tone={test.risk === 'critical' ? 'danger' : test.risk === 'high' ? 'warning' : 'muted'}>{test.risk}</Badge>
                      </td>
                      <td className="px-5 py-4">{test.status}</td>
                      <td className="px-5 py-4 font-semibold">{test.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function NewBatchModal({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: { name: string; rubricId: string; mode: RecordingMode }) => void }) {
  const [name, setName] = useState('Pitch practice batch');
  const [rubricId, setRubricId] = useState(trainingRubrics[0].id);
  const [mode, setMode] = useState<RecordingMode>('browser_recording');

  return (
    <Portal>
      <div className="fixed inset-0 z-40 grid place-items-center bg-foreground/24 p-4 backdrop-blur-sm">
        <div role="dialog" aria-modal="true" className="grid w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-panel">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-xl font-semibold">New Recording Batch</h2>
            <p className="mt-1 text-sm text-muted-foreground">ตั้งชื่อชุดงาน เลือกวิธีบันทึกเสียง และเกณฑ์การประเมิน</p>
          </div>
          <div className="grid gap-4 p-5">
            <Field label="Batch name">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Training rubric">
              <Select value={rubricId} onChange={(event) => setRubricId(event.target.value)}>
                {trainingRubrics.map((rubric) => (
                  <option key={rubric.id} value={rubric.id}>
                    {rubric.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <SegmentButton
                active={mode === 'browser_recording'}
                onClick={() => setMode('browser_recording')}
                icon={<FiMic className="h-4 w-4" />}
                description="สร้าง session ก่อน แล้วค่อยเข้า batch เพื่อบันทึกเสียง"
              >
                Record audio
              </SegmentButton>
              <SegmentButton
                active={mode === 'audio_upload'}
                onClick={() => setMode('audio_upload')}
                icon={<FiUploadCloud className="h-4 w-4" />}
                description="สร้าง batch สำหรับอัปโหลดไฟล์เสียงภายหลัง"
              >
                Upload audio
              </SegmentButton>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
              {mode === 'browser_recording'
                ? 'ระบบจะสร้าง recording session/batch ก่อน ยังไม่เริ่มอัดเสียงทันที หลังสร้างแล้วให้เข้า batch เพื่อกด Record attempt และเลือกส่ง queue เมื่อพร้อม'
                : 'ระบบจะรับไฟล์ mp3, wav, m4a, webm หลายไฟล์ แล้ว process เรียงทีละไฟล์ใน batch'}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onCreate({ name, rubricId, mode })}>
              <FiPlus className="h-4 w-4" />
              Create batch
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  children,
  description,
  compact = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  description?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-w-0 rounded-md text-sm font-semibold transition',
        compact
          ? 'inline-flex h-9 items-center justify-center gap-2 px-3'
          : 'grid min-h-20 justify-items-center gap-1 border px-4 py-3 text-center',
        active
          ? compact
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'border-primary bg-primary text-primary-foreground'
          : compact
            ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            : 'border-border bg-card text-foreground hover:bg-muted',
      ].join(' ')}
    >
      <span className="inline-flex min-w-0 items-center justify-center gap-2">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      {description ? (
        <span className={['text-xs font-medium leading-5', active ? 'text-primary-foreground/80' : 'text-muted-foreground'].join(' ')}>
          {description}
        </span>
      ) : null}
    </button>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'default' | 'success' | 'warning' | 'danger' }) {
  const toneClass =
    tone === 'success'
      ? 'bg-success'
      : tone === 'warning'
        ? 'bg-warning'
        : tone === 'danger'
          ? 'bg-destructive'
          : 'bg-primary';

  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-semibold leading-none">{value}</p>
      </div>
      <span className={['h-2.5 w-2.5 shrink-0 rounded-full', toneClass].join(' ')} aria-hidden="true" />
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium">{label}</span>
        <span className="font-semibold">{value ? `${value}/100` : '-'}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function modeLabel(mode: RecordingMode) {
  return mode === 'browser_recording' ? 'Record audio' : 'Upload audio';
}

function statusLabel(status: BatchStatus) {
  const labels: Record<BatchStatus, string> = {
    queued: 'queued',
    processing: 'processing',
    completed: 'completed',
    needs_coaching: 'needs coaching',
  };
  return labels[status];
}

function statusTone(status: BatchStatus): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'completed') return 'success';
  if (status === 'needs_coaching') return 'danger';
  if (status === 'processing') return 'warning';
  return 'muted';
}

function attemptStatusLabel(status: Attempt['status']) {
  const labels: Record<Attempt['status'], string> = {
    draft: 'draft',
    queued: 'queued',
    processing: 'processing',
    scored: 'scored',
  };
  return labels[status];
}

function attemptStatusTone(status: Attempt['status']): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'scored') return 'success';
  if (status === 'processing') return 'warning';
  if (status === 'queued') return 'default';
  return 'muted';
}
