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
      className="h-10 w-full min-w-0 appearance-none rounded-lg border border-input bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-no-repeat pl-3 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
      {...props}
    />
  );
}
