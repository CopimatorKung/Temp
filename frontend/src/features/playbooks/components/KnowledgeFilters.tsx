import { Field, Select } from '../../../components/ui/Field';
import { categories } from '../mock-data';

export type KnowledgeSort = 'updated' | 'title' | 'pages';

type KnowledgeFiltersProps = {
  availableTags: string[];
  bookCount: number;
  selectedCategoryId: string;
  selectedSort: KnowledgeSort;
  selectedTag: string;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: KnowledgeSort) => void;
  onTagChange: (tag: string) => void;
  getCategoryCount: (categoryId: string) => number;
};

const sortOptions: Array<{ label: string; value: KnowledgeSort }> = [
  { label: 'Updated', value: 'updated' },
  { label: 'Title', value: 'title' },
  { label: 'Pages', value: 'pages' },
];

export function KnowledgeFilters({
  availableTags,
  bookCount,
  selectedCategoryId,
  selectedSort,
  selectedTag,
  onCategoryChange,
  onSortChange,
  onTagChange,
  getCategoryCount,
}: KnowledgeFiltersProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_220px_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">Sort my results by</p>
          <div className="mt-2 inline-grid min-w-[260px] grid-cols-3 rounded-lg border border-border bg-background p-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                className={[
                  'h-8 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedSort === option.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Select a category">
          <Select value={selectedCategoryId} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="all">All Categories ({categories.reduce((total, category) => total + getCategoryCount(category.id), 0)})</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title} ({getCategoryCount(category.id)})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Select tags">
          <Select value={selectedTag} onChange={(event) => onTagChange(event.target.value)}>
            <option value="all">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-3 text-sm font-semibold text-foreground lg:min-w-[120px]">
          <span>{bookCount}</span>
          <span className="text-xs text-muted-foreground">books</span>
        </div>
      </div>
    </section>
  );
}
