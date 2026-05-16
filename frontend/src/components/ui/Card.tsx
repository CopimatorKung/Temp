import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['rounded-lg border border-border bg-card text-card-foreground shadow-panel', className].join(
        ' ',
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={['border-b border-border px-5 py-4', className].join(' ')}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
}

export function CardContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={['p-5', className].join(' ')}>{children}</div>;
}
