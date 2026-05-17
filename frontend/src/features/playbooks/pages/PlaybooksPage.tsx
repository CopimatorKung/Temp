import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBookmark,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiMoreVertical,
  FiRefreshCw,
  FiSliders,
  FiTrash2,
  FiUploadCloud,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import { buildPath, routes } from '../../../app/routes';
import { initialSessions } from '../../training/voice-roleplay/mock-data';
import { CreateBookModal } from '../components/CreateBookModal';
import { BookGridCard, FavoriteKnowledgePanel } from '../components/KnowledgeBooks';
import { KnowledgeFilters, type KnowledgeSort } from '../components/KnowledgeFilters';
import { KnowledgeHeader } from '../components/KnowledgeHeader';
import { KnowledgeResourcePanel, UploadResourceModal } from '../components/KnowledgeResources';
import { MarkdownArticle, TiptapMarkdownEditor } from '../components/MarkdownEditor';
import {
  categories,
  knowledgeBooks,
  mediaAssets,
  type KnowledgeBook,
  type LibraryTab,
  type LibraryView,
} from '../mock-data';
import {
  countBookChapters,
  countBookPages,
  countBookTopics,
  countBooksInCategory,
  flattenBookPages,
  getBookLatestUpdatedAt,
} from '../utils/book-utils';

export function PlaybooksPage() {
  const navigate = useNavigate();
  const { categoryId, bookId } = useParams<{ categoryId?: string; bookId?: string }>();
  const allPages = useMemo(
    () =>
      knowledgeBooks.flatMap((book) =>
        book.chapters.flatMap((chapter) =>
          chapter.topics.flatMap((topic) =>
            topic.pages.map((page) => ({
              ...page,
              book,
              chapter,
              topic,
            })),
          ),
        ),
      ),
    [],
  );
  const senarioFavorites = useMemo(
    () =>
      initialSessions.flatMap((session) =>
        (session.knowledgeAcquired ?? [])
          .filter((item) => item.favorited)
          .map((item) => ({
            ...item,
            sessionTitle: session.title,
          })),
      ),
    [],
  );
  const [activeCategoryId, setActiveCategoryId] = useState('sales-playbook');
  const [createBookModalOpen, setCreateBookModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('content');
  const [libraryView, setLibraryView] = useState<LibraryView>('grid');
  const [knowledgeSort, setKnowledgeSort] = useState<KnowledgeSort>('updated');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(['media-hero-q2', 'media-product-demo']);
  const selectedCategoryId = categoryId ?? activeCategoryId;
  const activePage = allPages[0];
  const selectedBook = bookId ? knowledgeBooks.find((book) => book.id === bookId) : undefined;

  const availableTags = useMemo(() => Array.from(new Set(knowledgeBooks.flatMap((book) => flattenBookPages(book).flatMap((page) => page.tags)))).sort(), []);
  const filteredBooks = useMemo(() => {
    const books = knowledgeBooks.filter((book) => {
      const matchesCategory = selectedCategoryId === 'all' || book.categoryId === selectedCategoryId;
      const matchesTag = selectedTag === 'all' || flattenBookPages(book).some((page) => page.tags.includes(selectedTag));

      return matchesCategory && matchesTag;
    });

    return [...books].sort((first, second) => {
      if (knowledgeSort === 'title') {
        return first.title.localeCompare(second.title);
      }

      if (knowledgeSort === 'pages') {
        return countBookPages(second) - countBookPages(first);
      }

      return getBookLatestUpdatedAt(second).localeCompare(getBookLatestUpdatedAt(first));
    });
  }, [knowledgeSort, selectedCategoryId, selectedTag]);
  const openCategory = (nextCategoryId: string) => {
    setActiveCategoryId(nextCategoryId);
    navigate(buildPath.knowledgeCategory({ categoryId: nextCategoryId }));
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds((current) => (current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId]));
  };

  if (bookId) {
    return <BookDetailPage book={selectedBook} onBack={() => navigate(routes.playbooks)} />;
  }

  return (
    <main className="grid min-w-0 gap-4 p-4 md:p-5 lg:p-6">
      <KnowledgeHeader onCreateBook={() => setCreateBookModalOpen(true)} onOpenTools={() => setToolsDrawerOpen(true)} />

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategoryId === 'all' ? 'All Playbooks' : categories.find((category) => category.id === selectedCategoryId)?.title ?? 'Playbooks'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">เลือก category/tag แล้วเปิด playbook ที่ต้องการอ่านหรือแก้ไขต่อ</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="muted">{filteredBooks.length} books</Badge>
            <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => setToolsDrawerOpen(true)}>
              <FiSliders className="h-4 w-4" />
              Sort / filter
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookGridCard key={book.id} book={book} onOpen={() => navigate(buildPath.knowledgeBook({ bookId: book.id }))} />
          ))}
        </div>
      </section>

      {toolsDrawerOpen ? (
        <KnowledgeToolsDrawer
          activePageTitle={activePage.title}
          activeTab={libraryTab}
          activeView={libraryView}
          availableTags={availableTags}
          bookCount={filteredBooks.length}
          selectedMediaIds={selectedMediaIds}
          selectedCategoryId={selectedCategoryId}
          selectedSort={knowledgeSort}
          selectedTag={selectedTag}
          senarioFavorites={senarioFavorites}
          onClose={() => setToolsDrawerOpen(false)}
          onCategoryChange={openCategory}
          onSortChange={setKnowledgeSort}
          onTabChange={setLibraryTab}
          onTagChange={setSelectedTag}
          onViewChange={setLibraryView}
          onUploadResource={() => setUploadModalOpen(true)}
          onToggleMedia={toggleMediaSelection}
          onSelectAllMedia={() =>
            setSelectedMediaIds((current) => (current.length === mediaAssets.length ? [] : mediaAssets.map((asset) => asset.id)))
          }
        />
      ) : null}

      {createBookModalOpen && <CreateBookModal onClose={() => setCreateBookModalOpen(false)} />}
      {uploadModalOpen && (
        <UploadResourceModal
          activePageTitle={activePage.title}
          books={knowledgeBooks}
          onClose={() => setUploadModalOpen(false)}
        />
      )}
    </main>
  );
}

type KnowledgeToolsDrawerProps = {
  activePageTitle: string;
  activeTab: LibraryTab;
  activeView: LibraryView;
  availableTags: string[];
  bookCount: number;
  selectedMediaIds: string[];
  selectedCategoryId: string;
  selectedSort: KnowledgeSort;
  selectedTag: string;
  senarioFavorites: Array<(NonNullable<(typeof initialSessions)[number]['knowledgeAcquired']>[number]) & { sessionTitle: string }>;
  onClose: () => void;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: KnowledgeSort) => void;
  onTabChange: (tab: LibraryTab) => void;
  onTagChange: (tag: string) => void;
  onViewChange: (view: LibraryView) => void;
  onUploadResource: () => void;
  onToggleMedia: (mediaId: string) => void;
  onSelectAllMedia: () => void;
};

const toolStatusItems = [
  { label: 'Turso BM25', value: 'synced', tone: 'success' as const },
  { label: 'Kotaemon', value: 'ready', tone: 'default' as const },
  { label: 'LEANN', value: '2 pending', tone: 'warning' as const },
];

function KnowledgeToolsDrawer({
  activePageTitle,
  activeTab,
  activeView,
  availableTags,
  bookCount,
  selectedMediaIds,
  selectedCategoryId,
  selectedSort,
  selectedTag,
  senarioFavorites,
  onClose,
  onCategoryChange,
  onSortChange,
  onTabChange,
  onTagChange,
  onViewChange,
  onUploadResource,
  onToggleMedia,
  onSelectAllMedia,
}: KnowledgeToolsDrawerProps) {
  const secondaryTabs: Array<{ id: Exclude<LibraryTab, 'content'>; label: string }> = [
    { id: 'favorite', label: 'Favorite' },
    { id: 'files', label: 'Files' },
    { id: 'media', label: 'Media' },
  ];
  const drawerTab = activeTab === 'content' ? 'favorite' : activeTab;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="knowledge-tools-title"
          className="ml-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden border-l border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Library tools</p>
                <h2 id="knowledge-tools-title" className="mt-1 text-lg font-semibold text-foreground">
                  Secondary workspace
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">จัดการไฟล์ media, sync status และรายการ favorite โดยไม่เบียดพื้นที่ Playbooks</p>
              </div>
              <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close library tools">
                <FiX className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {toolStatusItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-background/70 px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                  <span className="mt-2 inline-flex">
                    <Badge tone={item.tone}>{item.value}</Badge>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {secondaryTabs.map((tab) => (
                <Button
                  key={tab.id}
                  type="button"
                  variant={drawerTab === tab.id ? 'primary' : 'secondary'}
                  className="h-9 px-3"
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
              <Button type="button" variant="secondary" className="ml-auto h-9 px-3" onClick={onUploadResource}>
                <FiUploadCloud className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </header>

          <div className="grid min-h-0 gap-4 overflow-y-auto p-5">
            <KnowledgeFilters
              availableTags={availableTags}
              bookCount={bookCount}
              selectedCategoryId={selectedCategoryId}
              selectedSort={selectedSort}
              selectedTag={selectedTag}
              onCategoryChange={onCategoryChange}
              onSortChange={onSortChange}
              onTagChange={onTagChange}
              getCategoryCount={(nextCategoryId) => countBooksInCategory(knowledgeBooks, nextCategoryId)}
            />

            {drawerTab === 'favorite' ? (
              <FavoriteKnowledgePanel favorites={senarioFavorites} />
            ) : (
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Resource tools for {activePageTitle}</p>
                  <div className="flex rounded-lg border border-border bg-background p-1">
                    {[
                      { id: 'table' as const, label: 'Table' },
                      { id: 'grid' as const, label: 'Grid' },
                    ].map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => onViewChange(view.id)}
                        className={[
                          'h-8 rounded-md px-3 text-xs font-semibold transition',
                          activeView === view.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        ].join(' ')}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
                <KnowledgeResourcePanel
                  activeTab={drawerTab}
                  activeView={activeView}
                  selectedMediaIds={selectedMediaIds}
                  onToggleMedia={onToggleMedia}
                  onSelectAllMedia={onSelectAllMedia}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </Portal>
  );
}

function BookDetailPage({ book, onBack }: { book?: KnowledgeBook; onBack: () => void }) {
  const safeBook = book ?? knowledgeBooks[0];
  const pages = flattenBookPages(safeBook);
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activePageId, setActivePageId] = useState(pages[0]?.id ?? '');
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set());
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set());
  const [favoriteChapters, setFavoriteChapters] = useState<Set<string>>(new Set());
  const [favoriteTopics, setFavoriteTopics] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const [draftMarkdown, setDraftMarkdown] = useState(activePage?.markdown ?? '');

  useEffect(() => {
    setDraftMarkdown(activePage?.markdown ?? '');
  }, [activePage?.id, activePage?.markdown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => Math.abs(first.boundingClientRect.top - 140) - Math.abs(second.boundingClientRect.top - 140))[0];
        const pageId = visibleEntry?.target.id.replace('knowledge-page-', '');

        if (pageId) {
          setActivePageId(pageId);
        }
      },
      { root: null, rootMargin: '-18% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    pages.forEach((page) => {
      const element = document.getElementById(`knowledge-page-${page.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [book?.id]);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const toggleTopic = (topicId: string) => {
    setCollapsedTopics((current) => {
      const next = new Set(current);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const selectPage = (pageId: string) => {
    setActivePageId(pageId);
    window.requestAnimationFrame(() => {
      document.getElementById(`knowledge-page-${pageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const editPage = (pageId: string) => {
    setActivePageId(pageId);
    setEditing(true);
    window.requestAnimationFrame(() => {
      document.getElementById(`knowledge-page-${pageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const toggleFavoriteChapter = (chapterId: string) => {
    setFavoriteChapters((current) => {
      const next = new Set(current);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const toggleFavoriteTopic = (topicId: string) => {
    setFavoriteTopics((current) => {
      const next = new Set(current);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  if (!book) {
    return (
      <main className="grid min-w-0 gap-4 p-4 md:p-5 lg:p-6">
        <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onBack} aria-label="Back to Knowledge" title="Back to Knowledge">
          <FiArrowLeft className="h-4 w-4" />
        </Button>
        <Card>
          <CardContent>
            <h1 className="text-xl font-semibold text-foreground">Book not found</h1>
            <p className="mt-1 text-sm text-muted-foreground">ไม่พบ book นี้ใน mock data</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid min-w-0 gap-4 p-3 md:p-4 lg:p-5">
      <header className="rounded-lg border border-border bg-card px-4 py-3 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 shrink-0 p-0"
              onClick={onBack}
              aria-label="Back to Knowledge"
              title="Back to Knowledge"
            >
              <FiArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Book Detail</p>
                <Badge tone={book.ragStatus === 'synced' ? 'success' : book.ragStatus === 'pending' ? 'warning' : 'danger'}>{book.ragStatus}</Badge>
                <Badge tone="muted">{favoriteChapters.size + favoriteTopics.size} favorites</Badge>
              </div>
              <h1 className="mt-1 truncate text-lg font-semibold text-foreground md:text-xl">{book.title}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {countBookChapters(book)} chapters · {countBookTopics(book)} topics · {countBookPages(book)} pages · Owner: {book.owner}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FiUser className="h-3.5 w-3.5 text-primary" />
                  Author: <strong className="font-semibold text-foreground">{book.author}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiClock className="h-3.5 w-3.5 text-primary" />
                  Last visit: <strong className="font-semibold text-foreground">{book.lastVisitedBy} · {book.lastVisitedSince}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiRefreshCw className="h-3.5 w-3.5 text-primary" />
                  Updated: <strong className="font-semibold text-foreground">{book.lastUpdatedBy} · {book.lastUpdatedSince}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <Button
              type="button"
              variant="secondary"
              className="h-9 w-9 p-0"
              onClick={() => setActionMenuOpen((current) => !current)}
              aria-label="Book actions"
              aria-expanded={actionMenuOpen}
            >
              <FiMoreVertical className="h-4 w-4" />
            </Button>
            {actionMenuOpen ? (
              <div className="absolute right-0 top-11 z-20 grid w-44 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-panel">
                <button
                  type="button"
                  onClick={() => {
                    setEditing((current) => !current);
                    setActionMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  <FiEdit2 className="h-4 w-4" />
                  {editing ? 'Done editing' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setActionMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
        <aside className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-panel xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Contents</p>
              <p className="mt-1 text-xs text-muted-foreground">{pages.length} pages in this book</p>
            </div>
            <Badge tone={book.ragStatus === 'synced' ? 'success' : book.ragStatus === 'pending' ? 'warning' : 'danger'}>{book.ragStatus}</Badge>
          </div>

          <div className="grid gap-1">
            {book.chapters.map((chapter, chapterIndex) => {
              const chapterCollapsed = collapsedChapters.has(chapter.id);

              return (
                <div key={chapter.id} className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                      {chapterCollapsed ? <FiChevronRight className="h-4 w-4 shrink-0" /> : <FiChevronDown className="h-4 w-4 shrink-0" />}
                      <span className="truncate">
                        {chapterIndex + 1}. {chapter.title}
                      </span>
                      <span className="ml-auto shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px]">{chapter.topics.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavoriteChapter(chapter.id)}
                      aria-label={favoriteChapters.has(chapter.id) ? `Remove ${chapter.title} from favorite` : `Favorite ${chapter.title}`}
                      aria-pressed={favoriteChapters.has(chapter.id)}
                      title={favoriteChapters.has(chapter.id) ? 'Remove favorite chapter' : 'Favorite chapter'}
                      className={[
                        'grid h-8 w-8 shrink-0 place-items-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        favoriteChapters.has(chapter.id)
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
                      ].join(' ')}
                    >
                      <FiBookmark className={favoriteChapters.has(chapter.id) ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                    </button>
                  </div>

                  {!chapterCollapsed && (
                    <div className="ml-3 grid gap-1 border-l border-border pl-2">
                      {chapter.topics.map((topic, topicIndex) => {
                        const topicCollapsed = collapsedTopics.has(topic.id);

                        return (
                          <div key={topic.id} className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleTopic(topic.id)}
                                className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm font-medium text-foreground transition hover:bg-secondary"
                              >
                                {topicCollapsed ? <FiChevronRight className="h-3.5 w-3.5 shrink-0" /> : <FiChevronDown className="h-3.5 w-3.5 shrink-0" />}
                                <span className="truncate">
                                  {chapterIndex + 1}.{topicIndex + 1} {topic.title}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleFavoriteTopic(topic.id)}
                                aria-label={favoriteTopics.has(topic.id) ? `Remove ${topic.title} from favorite` : `Favorite ${topic.title}`}
                                aria-pressed={favoriteTopics.has(topic.id)}
                                title={favoriteTopics.has(topic.id) ? 'Remove favorite topic' : 'Favorite topic'}
                                className={[
                                  'grid h-8 w-8 shrink-0 place-items-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                  favoriteTopics.has(topic.id)
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
                                ].join(' ')}
                              >
                                <FiBookmark className={favoriteTopics.has(topic.id) ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                              </button>
                            </div>

                            {!topicCollapsed && (
                              <div className="ml-5 grid gap-1">
                                {topic.pages.map((page) => (
                                  <button
                                    key={page.id}
                                    type="button"
                                    onClick={() => selectPage(page.id)}
                                    className={[
                                      'min-w-0 rounded-md px-2 py-1.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                      activePage?.id === page.id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                                    ].join(' ')}
                                  >
                                    <span className="line-clamp-2">{page.title}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="grid min-w-0 gap-4">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle>Reader</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">อ่านต่อเนื่องทั้ง book ตาม chapter และ topic เหมือน e-book reader</p>
                </div>
                <Badge tone="muted">continuous</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <article className="mx-auto grid max-w-5xl gap-8 px-5 py-6 md:px-8 lg:px-10">
                {book.chapters.map((chapter, chapterIndex) => (
                  <section key={chapter.id} className="grid gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Chapter {chapterIndex + 1}</p>
                        <h2 className="mt-1 text-2xl font-semibold text-foreground">{chapter.title}</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8 px-3 text-xs"
                          onClick={() => editPage(chapter.topics[0]?.pages[0]?.id ?? activePageId)}
                        >
                          <FiEdit2 className="h-4 w-4" />
                          Edit chapter
                        </Button>
                        <Button
                          type="button"
                          variant={favoriteChapters.has(chapter.id) ? 'primary' : 'secondary'}
                          className="h-8 px-3 text-xs"
                          onClick={() => toggleFavoriteChapter(chapter.id)}
                        >
                          <FiBookmark className={favoriteChapters.has(chapter.id) ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                          {favoriteChapters.has(chapter.id) ? 'Favorited' : 'Favorite'}
                        </Button>
                      </div>
                    </div>

                    {chapter.topics.map((topic, topicIndex) => (
                      <section key={topic.id} className="grid gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Topic {chapterIndex + 1}.{topicIndex + 1}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">{topic.title}</h3>
                          </div>
                          <Button
                            type="button"
                            variant={favoriteTopics.has(topic.id) ? 'primary' : 'secondary'}
                            className="h-8 px-3 text-xs"
                            onClick={() => toggleFavoriteTopic(topic.id)}
                          >
                            <FiBookmark className={favoriteTopics.has(topic.id) ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                            {favoriteTopics.has(topic.id) ? 'Favorited' : 'Favorite'}
                          </Button>
                        </div>

                        {topic.pages.map((page) => {
                          const pageIsActive = activePage?.id === page.id;
                          const pageIsEditing = editing && pageIsActive;

                          return (
                            <section
                              key={page.id}
                              id={`knowledge-page-${page.id}`}
                              className={[
                                'scroll-mt-24 rounded-lg border p-4 transition md:p-5',
                                pageIsActive ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border bg-background/60',
                                pageIsEditing ? 'ring-2 ring-primary/18' : '',
                              ].join(' ')}
                            >
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-xl font-semibold text-foreground">{page.title}</h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {page.readTime} · updated {page.updatedAt}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant={pageIsEditing ? 'primary' : 'secondary'}
                                  className="h-8 px-3 text-xs"
                                  onClick={() => {
                                    if (pageIsEditing) {
                                      setEditing(false);
                                    } else {
                                      editPage(page.id);
                                    }
                                  }}
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                  {pageIsEditing ? 'Done editing' : 'Edit'}
                                </Button>
                                {pageIsEditing ? <Badge tone="warning">editing this page</Badge> : null}
                                <Badge tone={page.status === 'published' ? 'success' : page.status === 'review' ? 'warning' : 'muted'}>{page.status}</Badge>
                                {page.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} tone="muted">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {pageIsEditing ? (
                              <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Field label="Page title">
                                    <Input defaultValue={page.title} />
                                  </Field>
                                  <Field label="Status">
                                    <Select defaultValue={page.status}>
                                      <option value="draft">draft</option>
                                      <option value="review">review</option>
                                      <option value="published">published</option>
                                    </Select>
                                  </Field>
                                </div>
                                <TiptapMarkdownEditor markdown={draftMarkdown} onChange={setDraftMarkdown} />
                              </div>
                            ) : (
                              <MarkdownArticle markdown={page.markdown} />
                            )}
                          </section>
                          );
                        })}
                      </section>
                    ))}
                  </section>
                ))}
              </article>
            </CardContent>
          </Card>
        </section>
      </section>

      {deleteModalOpen && <DeleteBookModal bookTitle={book.title} onClose={() => setDeleteModalOpen(false)} onConfirm={onBack} />}
    </main>
  );
}

function DeleteBookModal({ bookTitle, onClose, onConfirm }: { bookTitle: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-book-title"
          className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="border-b border-border px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Confirm delete</p>
            <h2 id="delete-book-title" className="mt-1 text-lg font-semibold text-foreground">
              Delete book?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              คุณกำลังจะลบ “{bookTitle}” จาก mock library. ในระบบจริง action นี้ควร archive ก่อนลบถาวรเพื่อกัน source citation หาย
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Delete book
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
