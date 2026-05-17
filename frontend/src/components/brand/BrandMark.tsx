type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
};

const sizeClass = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
};

const textSizeClass = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export function BrandMark({ size = 'md', showWordmark = false }: BrandMarkProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-3">
      <div
        className={[
          'relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_40%_20%,hsl(42_82%_86%),hsl(42_64%_55%)_28%,hsl(210_9%_22%)_29%,hsl(210_9%_18%)_78%)] shadow-sm ring-1 ring-border',
          sizeClass[size],
        ].join(' ')}
        aria-hidden="true"
      >
        <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-warning/55 blur-md" />
        <span className="absolute bottom-1 left-1/2 h-1/3 w-3/5 -translate-x-1/2 rounded-full bg-foreground/20 blur-md" />
        <span className="relative font-serif text-[1.5em] font-black leading-none text-warning drop-shadow-[0_1px_1px_hsl(210_9%_12%)]">
          P
        </span>
      </div>
      {showWordmark ? (
        <span className="min-w-0">
          <span className={['block truncate font-semibold leading-tight text-foreground', textSizeClass[size]].join(' ')}>Pitchsmith</span>
          <span className="block truncate text-xs text-muted-foreground">AI Sales Training</span>
        </span>
      ) : null}
    </div>
  );
}
