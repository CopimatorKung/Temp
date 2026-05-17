import { useEffect } from 'react';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FiBold, FiHash, FiItalic, FiList } from 'react-icons/fi';

export function TiptapMarkdownEditor({ markdown, onChange }: { markdown: string; onChange: (nextMarkdown: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: markdown,
    contentType: 'markdown',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[358px] px-4 py-3 text-sm leading-6 text-foreground outline-none [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor || editor.getMarkdown() === markdown) {
      return;
    }

    editor.commands.setContent(markdown, { emitUpdate: false, contentType: 'markdown' });
  }, [editor, markdown]);

  const runCommand = (command: () => void) => {
    command();
    editor?.commands.focus();
  };

  const toolbarItems = [
    {
      label: 'Heading',
      icon: FiHash,
      active: editor?.isActive('heading', { level: 2 }) ?? false,
      onClick: () => runCommand(() => editor?.chain().focus().toggleHeading({ level: 2 }).run()),
    },
    {
      label: 'Bold',
      icon: FiBold,
      active: editor?.isActive('bold') ?? false,
      onClick: () => runCommand(() => editor?.chain().focus().toggleBold().run()),
    },
    {
      label: 'Italic',
      icon: FiItalic,
      active: editor?.isActive('italic') ?? false,
      onClick: () => runCommand(() => editor?.chain().focus().toggleItalic().run()),
    },
    {
      label: 'Bullet list',
      icon: FiList,
      active: editor?.isActive('bulletList') ?? false,
      onClick: () => runCommand(() => editor?.chain().focus().toggleBulletList().run()),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-white shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/35 px-3 py-2">
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={[
              'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition',
              item.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        ))}
        <span className="ml-auto rounded-full bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
          saved as Markdown
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function MarkdownArticle({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const contentLines = lines[0]?.startsWith('# ') ? lines.slice(1) : lines;

  return (
    <div className="grid gap-2 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
      {contentLines.map((line, index) => {
        if (line.startsWith('## ')) {
          return (
            <h5 key={`${line}-${index}`} className="mt-5 text-lg font-semibold leading-7 text-foreground">
              {line.replace('## ', '')}
            </h5>
          );
        }

        if (line.startsWith('- ')) {
          return (
            <p key={`${line}-${index}`} className="pl-4 text-foreground/80">
              • {line.replace('- ', '')}
            </p>
          );
        }

        if (/^\d+\. /.test(line)) {
          return (
            <p key={`${line}-${index}`} className="pl-4 text-foreground/80">
              {line}
            </p>
          );
        }

        if (!line.trim()) {
          return <div key={`empty-${index}`} className="h-1" />;
        }

        return (
          <p key={`${line}-${index}`} className="text-foreground/80">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');

  return (
    <div className="min-h-[420px] overflow-y-auto rounded-lg border border-border bg-card p-4 text-sm leading-6 shadow-sm">
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h2 key={`${line}-${index}`} className="mt-1 text-xl font-semibold text-foreground">
              {line.replace('# ', '')}
            </h2>
          );
        }

        if (line.startsWith('## ')) {
          return (
            <h3 key={`${line}-${index}`} className="mt-5 text-base font-semibold text-foreground">
              {line.replace('## ', '')}
            </h3>
          );
        }

        if (line.startsWith('- ')) {
          return (
            <p key={`${line}-${index}`} className="ml-3 text-muted-foreground">
              • {line.replace('- ', '')}
            </p>
          );
        }

        if (/^\\d+\\. /.test(line)) {
          return (
            <p key={`${line}-${index}`} className="ml-3 text-muted-foreground">
              {line}
            </p>
          );
        }

        if (!line.trim()) {
          return <div key={`empty-${index}`} className="h-2" />;
        }

        return (
          <p key={`${line}-${index}`} className="text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}
