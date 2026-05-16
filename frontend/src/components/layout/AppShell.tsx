import { useState, type ReactNode } from 'react';
import {
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiCheckSquare,
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
import { Breadcrumbs } from './Breadcrumbs';

const navItems = [
  { label: 'Home', href: routes.dashboard, icon: FiBarChart2, activePrefixes: ['/app/dashboard'] },
  { label: 'Quality', href: routes.audioNew, icon: FiCheckSquare, activePrefixes: ['/app/audio', '/app/template'] },
  { label: 'Ask', href: routes.trainingAsk, icon: FiSearch, activePrefixes: ['/app/training/ask'] },
  { label: 'Recordings', href: routes.recordingReview, icon: FiUploadCloud, activePrefixes: ['/app/training/recording-review', '/app/training/rubrics'] },
  { label: 'Senario', href: routes.voiceRoleplay, icon: FiMic, activePrefixes: ['/app/training/voice-roleplay'] },
  { label: 'Knowledge', href: routes.playbooks, icon: FiBookOpen, activePrefixes: ['/app/playbooks'] },
  { label: 'Onboard', href: routes.onboardingMe, icon: FiFileText, activePrefixes: ['/app/onboarding'] },
  { label: 'Settings', href: routes.adminUsers, icon: FiSettings, activePrefixes: ['/app/admin'] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={['min-h-screen lg:grid', isCollapsed ? 'lg:grid-cols-[80px_minmax(0,1fr)]' : 'lg:grid-cols-[264px_minmax(0,1fr)]'].join(' ')}>
      <aside className="flex min-w-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className={['flex h-16 items-center border-sidebar-border px-4 lg:border-b', isCollapsed ? 'justify-center lg:px-3' : 'justify-between'].join(' ')}>
          <div className={isCollapsed ? 'hidden lg:block lg:text-center' : ''}>
            <p className="text-sm font-semibold">Pitchsmith</p>
            {!isCollapsed && <p className="text-xs text-sidebar-foreground/68">AI Sales Training</p>}
          </div>
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => setIsCollapsed((value) => !value)}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:flex"
          >
            {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex flex-1 gap-1 overflow-auto p-3 lg:grid lg:auto-rows-min">
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
                  isCollapsed ? 'justify-center gap-0 px-2' : 'gap-3 px-3',
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

  return (
    <div className="relative border-sidebar-border p-3 lg:border-t">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title={isCollapsed ? 'Pim K. · Manager' : undefined}
        className={[
          'flex w-full items-center rounded-lg py-2 text-left transition hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isCollapsed ? 'justify-center gap-0 px-2' : 'gap-3 px-3',
        ].join(' ')}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
          PK
        </div>
        <div className={['min-w-0 flex-1', isCollapsed ? 'hidden' : ''].join(' ')}>
          <p className="truncate text-sm font-semibold">Pim K.</p>
          <p className="truncate text-xs text-sidebar-foreground/68">Manager</p>
        </div>
        <span
          className={[
            'rounded-full border border-success/20 bg-success/12 px-2 py-1 text-[11px] font-semibold text-success',
            isCollapsed ? 'hidden' : '',
          ].join(' ')}
        >
          active
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
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <FiUser className="h-4 w-4 text-muted-foreground" />
            Edit profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
            onClick={() => setOpen(false)}
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
