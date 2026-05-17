import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...inputProps } = props;

  return (
    <input
      className={[
        'h-10 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...inputProps}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-10 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
      {...props}
    />
  );
}
