import type { ComponentType } from 'react';
import { FiClock, FiGrid, FiUsers } from 'react-icons/fi';
import type { RoleplayTab } from '../types';

const tabs: Array<{ id: RoleplayTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'session-history', label: 'Session History', icon: FiClock },
  { id: 'persona-management', label: 'Persona Management', icon: FiUsers },
  { id: 'meeting-room', label: 'Meeting Room', icon: FiGrid },
];

export function RoleplayTabs({ activeTab, onChange }: { activeTab: RoleplayTab; onChange: (tab: RoleplayTab) => void }) {
  return (
    <div className="inline-grid w-full gap-2 rounded-lg border border-border bg-card p-1 sm:w-auto sm:grid-cols-3">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
