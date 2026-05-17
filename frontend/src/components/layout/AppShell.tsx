import { useState, type ReactNode } from 'react';
import {
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiCheckSquare,
  FiCheckCircle,
  FiFileText,
  FiLogOut,
  FiMic,
  FiSearch,
  FiSettings,
  FiUploadCloud,
  FiUser,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../ui/Button';
import { Portal } from '../ui/Portal';
import { Breadcrumbs } from './Breadcrumbs';

const navItems = [
  { label: 'Home', href: routes.dashboard, icon: FiBarChart2, activePrefixes: ['/app/dashboard'] },
  { label: 'Quality', href: routes.audioNew, icon: FiCheckSquare, activePrefixes: ['/app/audio', '/app/template'] },
  { label: 'Ask', href: routes.trainingAsk, icon: FiSearch, activePrefixes: ['/app/training/ask'] },
  { label: 'Recordings', href: routes.recordingReview, icon: FiUploadCloud, activePrefixes: ['/app/training/recording-review', '/app/training/rubrics'] },
  { label: 'Senario', href: routes.voiceRoleplay, icon: FiMic, activePrefixes: ['/app/training/voice-roleplay'] },
  { label: 'Knowledge', href: routes.playbooks, icon: FiBookOpen, activePrefixes: ['/app/playbooks', '/app/knowledge'] },
  { label: 'Onboard', href: routes.onboardingMe, icon: FiFileText, activePrefixes: ['/app/onboarding'] },
  { label: 'Settings', href: routes.settings, icon: FiSettings, activePrefixes: ['/app/settings', '/app/admin'] },
];

const currentUser = {
  initials: 'PK',
  name: 'Pim K.',
  role: 'Manager',
  highestBadge: 'Voice Architect',
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={['min-h-screen lg:grid', isCollapsed ? 'lg:grid-cols-[72px_minmax(0,1fr)]' : 'lg:grid-cols-[232px_minmax(0,1fr)]'].join(' ')}>
      <aside className="flex min-w-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div
          className={[
            'relative flex h-14 items-center border-sidebar-border px-3 lg:border-b',
            isCollapsed ? 'justify-center lg:px-2' : 'justify-between gap-2',
          ].join(' ')}
        >
          <Link
            to={routes.dashboard}
            title={isCollapsed ? 'Pitchsmith · AI Sales Training' : undefined}
            className={[
              'min-w-0 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
              isCollapsed ? 'hidden h-9 w-9 place-items-center bg-sidebar-accent text-[13px] font-semibold text-sidebar-primary shadow-sm ring-1 ring-sidebar-primary/12 lg:grid' : 'block',
            ].join(' ')}
          >
            {isCollapsed ? (
              <span aria-hidden="true">PS</span>
            ) : (
              <>
                <p className="truncate text-[13px] font-semibold">Pitchsmith</p>
                <p className="truncate text-xs text-sidebar-foreground/68">AI Sales Training</p>
              </>
            )}
            <span className="sr-only">Pitchsmith home</span>
          </Link>
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => setIsCollapsed((value) => !value)}
            className={[
              'hidden items-center justify-center rounded-lg text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:flex',
              isCollapsed ? 'absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2' : 'h-8 w-8 shrink-0',
            ].join(' ')}
          >
            {isCollapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex flex-1 gap-1 overflow-auto p-2.5 lg:grid lg:auto-rows-min">
          {navItems.map((item) => {
            const isRouteActive = item.activePrefixes.some((prefix) => location.pathname.startsWith(prefix));

            return (
              <Link
                key={item.label}
                to={item.href}
                title={isCollapsed ? item.label : undefined}
                aria-current={isRouteActive ? 'page' : undefined}
                className={[
                  'relative flex min-w-fit items-center rounded-lg py-2 text-left text-sm transition lg:min-w-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isCollapsed ? 'justify-center gap-0 px-2' : 'gap-3 px-2.5',
                  isRouteActive
                    ? [
                        'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-primary/18',
                        'before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary',
                      ].join(' ')
                    : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                ].join(' ')}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={isCollapsed ? 'sr-only' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <UserBadge isCollapsed={isCollapsed} />
      </aside>
      <main className="min-w-0">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  );
}

function UserBadge({ isCollapsed }: { isCollapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutConfirmed, setLogoutConfirmed] = useState(false);

  return (
    <div className="relative border-sidebar-border p-2.5 lg:border-t">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title={isCollapsed ? `${currentUser.name} · ${currentUser.role} · ${currentUser.highestBadge}` : undefined}
        className={[
          'flex w-full items-center rounded-lg py-2 text-left transition hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isCollapsed ? 'justify-center gap-0 px-2' : 'gap-2.5 px-2.5',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground',
            isCollapsed ? 'border border-sidebar-primary/30 shadow-sm ring-2 ring-sidebar-background' : '',
          ].join(' ')}
        >
          {currentUser.initials}
        </div>
        <div className={['min-w-0 flex-1', isCollapsed ? 'hidden' : ''].join(' ')}>
          <p className="truncate text-sm font-semibold">{currentUser.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/68">{currentUser.role}</p>
        </div>
        <span
          title={currentUser.highestBadge}
          className={[
            'inline-flex max-w-[92px] items-center gap-1 truncate rounded-full border border-sidebar-primary/20 bg-sidebar-primary/10 px-2 py-1 text-[11px] font-semibold text-sidebar-primary',
            isCollapsed ? 'hidden' : '',
          ].join(' ')}
        >
          <FiAward className="h-3 w-3 shrink-0" />
          <span className="truncate">{currentUser.highestBadge}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute bottom-[76px] z-20 w-56 overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-panel',
            isCollapsed ? 'left-3 lg:left-[calc(100%+8px)] lg:right-auto lg:bottom-3' : 'left-3 right-3',
          ].join(' ')}
        >
          <Link
            to={routes.profile}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <FiUser className="h-4 w-4 text-muted-foreground" />
            Edit profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
            onClick={() => {
              setOpen(false);
              setLogoutOpen(true);
              setLogoutConfirmed(false);
            }}
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}

      {logoutOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-panel">
              <div className="border-b border-border p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account session</p>
                <h2 id="logout-title" className="mt-2 text-xl font-semibold text-foreground">
                  {logoutConfirmed ? 'Logged out from mock session' : 'Logout from Pitchsmith?'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {logoutConfirmed
                    ? 'ระบบ mock แสดงสถานะ logout สำเร็จแล้ว ใน production จะ clear token และ redirect ไปหน้า sign in'
                    : 'ยืนยันก่อนออกจาก workspace เพื่อป้องกันการกดผิดระหว่าง review หรือ training session'}
                </p>
              </div>
              <div className="grid gap-3 p-5">
                {logoutConfirmed ? (
                  <div className="flex items-start gap-3 rounded-lg border border-success/25 bg-success/12 p-3 text-success">
                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm font-semibold">Mock logout completed</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="text-sm font-semibold text-foreground">Current user</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currentUser.name} · {currentUser.role} · {currentUser.highestBadge}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setLogoutOpen(false)}>
                    {logoutConfirmed ? 'Close' : 'Cancel'}
                  </Button>
                  {!logoutConfirmed && (
                    <Button type="button" variant="destructive" onClick={() => setLogoutConfirmed(true)}>
                      <FiLogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
