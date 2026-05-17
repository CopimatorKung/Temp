import { FiBookOpen, FiBookmark } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { categories, type KnowledgeBook } from '../mock-data';
import { countBookChapters, countBookPages, countBookTopics } from '../utils/book-utils';

type BookGridCardProps = {
  book: KnowledgeBook;
  onOpen: () => void;
};

export function BookGridCard({ book, onOpen }: BookGridCardProps) {
  const category = categories.find((item) => item.id === book.categoryId);
  const Icon = category?.icon ?? FiBookOpen;

  return (
    <article className="grid min-w-0 gap-3 rounded-lg border border-border bg-background/75 p-3 transition hover:border-primary/60 hover:bg-primary/5">
      <div className="flex items-start justify-between gap-3">
        <span className={['grid h-10 w-10 place-items-center rounded-lg', category?.tone ?? 'bg-primary/10 text-primary'].join(' ')}>
          <Icon className="h-5 w-5" />
        </span>
        <Badge tone={book.ragStatus === 'synced' ? 'success' : book.ragStatus === 'pending' ? 'warning' : 'danger'}>{book.ragStatus}</Badge>
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{book.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{category?.title ?? 'Knowledge'} · Owner: {book.owner}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Chapter', value: countBookChapters(book) },
          { label: 'Topic', value: countBookTopics(book) },
          { label: 'Page', value: countBookPages(book) },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-card px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
      <Button type="button" className="h-9" onClick={onOpen}>
        <FiBookOpen className="h-4 w-4" />
        Open book
      </Button>
    </article>
  );
}

export function FavoriteKnowledgePanel({
  favorites,
}: {
  favorites: Array<{
    id: string;
    title: string;
    focus: string;
    type: string;
    sessionTitle: string;
  }>;
}) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">Favorite from Senario</h2>
          <p className="mt-1 text-sm text-muted-foreground">sources ที่ user กดเก็บไว้ระหว่างฝึก Senario เพื่อกลับมาอ่านภายหลัง</p>
        </div>
        <Badge tone="muted">{favorites.length} saved</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((favorite) => (
          <article key={`${favorite.sessionTitle}-${favorite.id}`} className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FiBookmark className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{favorite.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{favorite.sessionTitle}</p>
              </div>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{favorite.focus}</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="default">{favorite.type}</Badge>
              <Badge tone="muted">saved</Badge>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
