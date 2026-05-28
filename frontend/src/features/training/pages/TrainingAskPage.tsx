import { useState, type ReactNode } from "react";
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiEye,
  FiMessageSquare,
  FiPaperclip,
  FiPlus,
  FiSend,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { buildPath, routes } from "../../../app/routes";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Portal } from "../../../components/ui/Portal";

const sessions = [
  {
    id: "ask-001",
    title: "โปร Q2 สำหรับ SME",
    preview: "ใช้กับร้านค้ารายย่อยได้ไหม",
    time: "10:42",
  },
  {
    id: "ask-002",
    title: "เทียบ Product A กับคู่แข่ง",
    preview: "ข้อดีที่พูดได้โดยไม่ overclaim",
    time: "09:18",
  },
  {
    id: "ask-003",
    title: "ลูกค้าบอกว่าแพง",
    preview: "ควรตอบ objection ยังไง",
    time: "เมื่อวาน",
  },
];

const citations = [
  {
    title: "Q2 Promotion Playbook",
    section: "Promotion / SME eligibility",
    snippet:
      "ใช้ได้กับร้านค้ารายย่อยที่เปิดบัญชีใหม่และมียอดขั้นต่ำตามเงื่อนไขแคมเปญ",
    href: `${buildPath.knowledgeBook({ bookId: "book-q2-sme" })}#q2-promotion-terms`,
  },
  {
    title: "Compliance Guardrail",
    section: "Promotion claim rules",
    snippet:
      "ห้ามพูดว่ารับประกันยอดขาย ต้องแจ้งวันหมดอายุและข้อจำกัดสิทธิ์ให้ครบ",
    href: `${buildPath.knowledgeBook({ bookId: "book-q2-sme" })}#promotion-claim-guardrail`,
  },
];

export function TrainingAskPage() {
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const [draft, setDraft] = useState("โปร Q2 ใช้กับร้านค้ารายย่อยได้ไหม");
  const [pendingCitation, setPendingCitation] = useState<
    (typeof citations)[number] | null
  >(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [citationsOpen, setCitationsOpen] = useState(false);
  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const layoutClass = getAskLayoutClass(sessionsOpen, citationsOpen);

  const openPendingCitation = () => {
    if (!pendingCitation) return;
    navigate(pendingCitation.href);
    setPendingCitation(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <main
        className={[
          "flex-1 grid min-w-0 overflow-hidden gap-3 p-4 md:p-5 lg:p-6",
          layoutClass,
        ].join(" ")}
      >
        {sessionsOpen && (
          <Card className="min-w-0 border-0 bg-card/45 shadow-none">
            <CardHeader className="border-b-0 px-0 pb-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Sessions</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ประวัติ chat
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="New Session"
                    title="New Session"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Collapse sessions"
                    title="Collapse sessions"
                    onClick={() => setSessionsOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-1.5 p-0">
              {sessions.map((session) => {
                const active = session.id === activeSession.id;

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setActiveSessionId(session.id)}
                    className={[
                      "rounded-lg border px-2.5 py-2 text-left transition",
                      active
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border bg-card hover:bg-muted",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2">
                      <FiMessageSquare
                        className={[
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        ].join(" ")}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-5">
                          {session.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] leading-4 text-muted-foreground">
                          {session.preview}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                          {session.time}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-panel">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <PanelToggleButton
              icon={<FiMessageSquare className="h-4 w-4" />}
              label="Sessions"
              count={sessions.length}
              active={sessionsOpen}
              onClick={() => setSessionsOpen((v) => !v)}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="truncate text-base font-semibold text-foreground">
                {activeSession.title}
              </h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                AI ตอบจากฐานความรู้เท่านั้น หากไม่มีข้อมูลจะแจ้งให้ทราบ
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone="success">citation required</Badge>
              <PanelToggleButton
                icon={<FiBookOpen className="h-4 w-4" />}
                label="Citations"
                count={citations.length}
                active={citationsOpen}
                onClick={() => setCitationsOpen((v) => !v)}
              />
              <div className="h-5 w-px bg-border" />
              <Link to={routes.playbooks}>
                <button
                  type="button"
                  title="Knowledge Settings"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FiSettings className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-muted/55">
            <div className="grid flex-1 content-start gap-5 overflow-y-auto px-4 py-5 md:px-6">
              <ChatBubble role="user" time="10:42">
                โปร Q2 ใช้กับร้านค้ารายย่อยได้ไหม
                และต้องแจ้งเงื่อนไขอะไรกับลูกค้าบ้าง
              </ChatBubble>
              <ChatBubble role="assistant" time="10:42">
                ใช้ได้กับร้านค้ารายย่อยที่เข้าเกณฑ์ SME และต้องแจ้งวันหมดอายุ
                เงื่อนไขยอดขั้นต่ำ และข้อจำกัดสิทธิ์ให้ครบ
                ห้ามพูดว่าโปรนี้รับประกันยอดขายหรือการเติบโตแน่นอน
              </ChatBubble>
              <div className="ml-12 max-w-[760px] rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6 text-warning">
                <p className="font-semibold">Guardrail note</p>
                <p className="mt-1">
                  ถ้าถามเรื่องราคาเฉพาะรายหรือเงื่อนไขที่ไม่มีใน Playbook
                  ระบบควร abstain และแนะนำให้ตรวจสอบกับ owner
                </p>
              </div>
            </div>

            <div className="border-t border-border bg-card p-3 md:p-4">
              <div className="grid rounded-lg border border-input bg-white p-2 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                <label className="sr-only" htmlFor="ask-message">
                  Message
                </label>
                <textarea
                  id="ask-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  placeholder="Ask about product, promotion, competitor or objection..."
                  className="min-h-[72px] min-w-0 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <FiPaperclip className="h-4 w-4" />
                    Attach context
                  </button>
                  <Button className="h-9">
                    <FiSend className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {citationsOpen && (
          <aside className="grid content-start gap-3">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="border-b-0 px-0 pb-2 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Citations</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      แหล่งอ้างอิงคำตอบ
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Collapse citations"
                    title="Collapse citations"
                    onClick={() => setCitationsOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 p-0">
                {citations.map((citation) => (
                  <div
                    key={citation.title}
                    className="group rounded-lg border border-border bg-white p-2.5 transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <FiBookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">
                          {citation.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {citation.section}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                          {citation.snippet}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Open reference for ${citation.title}`}
                        title="Open reference"
                        onClick={() => setPendingCitation(citation)}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        )}
      </main>

      {pendingCitation && (
        <Portal>
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/24 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={() => setPendingCitation(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="open-citation-title"
              className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-panel"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Knowledge Reference
                  </p>
                  <h2
                    id="open-citation-title"
                    className="mt-1 text-lg font-semibold text-foreground"
                  >
                    Open this reference?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    ระบบจะพาไปยังหน้า Knowledge ที่เป็น source ของ citation นี้
                    เพื่ออ่าน context ก่อนตอบต่อ
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close reference confirmation"
                  title="Close"
                  onClick={() => setPendingCitation(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 p-5">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex items-start gap-3">
                    <FiBookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {pendingCitation.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pendingCitation.section}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {pendingCitation.snippet}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  กดยืนยันเพื่อออกจาก chat session ปัจจุบันและเปิด reference
                  page ใน Knowledge
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingCitation(null)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={openPendingCitation}>
                  <FiEye className="h-4 w-4" />
                  Open reference
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function ChatBubble({
  role,
  time,
  children,
}: {
  role: "user" | "assistant";
  time: string;
  children: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={["flex gap-3", isUser ? "justify-end" : "justify-start"].join(
        " ",
      )}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <FiCpu className="h-4 w-4" />
        </div>
      )}
      <div
        className={[
          "grid max-w-[min(78ch,82%)] gap-1",
          isUser ? "justify-items-end" : "justify-items-start",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{isUser ? "You" : "SaleSync AI"}</span>
          <span>{time}</span>
        </div>
        <div
          className={[
            "rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border bg-white text-foreground",
          ].join(" ")}
        >
          {children}
        </div>
      </div>
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <FiUser className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function PanelToggleButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${active ? "Collapse" : "Expand"} ${label}`}
      title={`${active ? "Collapse" : "Expand"} ${label}`}
      className={[
        "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
      ].join(" ")}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span
        className={[
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
          active
            ? "bg-white/20 text-white"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function getAskLayoutClass(sessionsOpen: boolean, citationsOpen: boolean) {
  if (sessionsOpen && citationsOpen) {
    return "xl:grid-cols-[220px_minmax(0,1fr)_260px] 2xl:grid-cols-[240px_minmax(0,1fr)_280px]";
  }

  if (sessionsOpen) {
    return "xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)]";
  }

  if (citationsOpen) {
    return "xl:grid-cols-[minmax(0,1fr)_260px] 2xl:grid-cols-[minmax(0,1fr)_280px]";
  }

  return "xl:grid-cols-[minmax(0,1fr)]";
}
