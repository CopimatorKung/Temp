import type { KnowledgeBook } from '../mock-data';

export function countBookChapters(book: KnowledgeBook) {
  return book.chapters.length;
}

export function countBookTopics(book: KnowledgeBook) {
  return book.chapters.reduce((total, chapter) => total + chapter.topics.length, 0);
}

export function countBookPages(book: KnowledgeBook) {
  return book.chapters.reduce(
    (total, chapter) => total + chapter.topics.reduce((topicTotal, topic) => topicTotal + topic.pages.length, 0),
    0,
  );
}

export function getBookLatestUpdatedAt(book: KnowledgeBook) {
  return flattenBookPages(book).reduce((latest, page) => (page.updatedAt > latest ? page.updatedAt : latest), '');
}

export function countBooksInCategory(books: KnowledgeBook[], categoryId: string) {
  return books.filter((book) => book.categoryId === categoryId).length;
}

export function flattenBookPages(book: KnowledgeBook) {
  return book.chapters.flatMap((chapter) =>
    chapter.topics.flatMap((topic) =>
      topic.pages.map((page) => ({
        ...page,
        chapter,
        topic,
      })),
    ),
  );
}
