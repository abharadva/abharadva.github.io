"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Code, CodeSquare, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Heading3, List, Quote } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const markdownToHtml = (markdown: string): string => {
    if (typeof window === 'undefined' || !DOMPurify.sanitize) {
        return markdown; // Fallback for SSR
    }
    const sanitizedMarkdown = DOMPurify.sanitize(markdown);

    // This is a very simplified parser, not intended to replace robust libraries
    // It's designed for basic previews and might not handle complex nesting perfectly.
    // For production-grade previews, `react-markdown` is still recommended.
    let html = ' ' + sanitizedMarkdown;
    html = html
        .replace(/\n/g, '\n<br>') // Preserve line breaks for easier paragraph splitting later
        .replace(/```([\s\S]*?)```/g, (_match, p1) => `<pre class='bg-muted text-muted-foreground p-3 my-3 rounded-md overflow-x-auto font-mono text-sm'><code class='font-mono'>${p1.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n<br>/g, '\n')}</code></pre>`)
        .replace(/`([^`]+)`/g, "<code class='bg-muted text-muted-foreground px-1 py-0.5 font-mono text-sm rounded-sm'>$1</code>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/\!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" class="max-w-full h-auto my-3 rounded-lg border" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, "<strong>$1$2</strong>")
        .replace(/\*(.*?)\*|_(.*?)_/gim, "<em>$1$2</em>")
        .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
        .replace(/^\s*([-*+]) (.*)/gm, "<ul><li>$2</li></ul>") // Very basic list support
        .replace(/^\s*(\d+\.) (.*)/gm, "<ol><li>$2</li></ol>")
        .replace(/<\/ul>(\n<br>)*<ul>/g, '') // Consolidate adjacent lists
        .replace(/<\/ol>(\n<br>)*<ol>/g, '');

    // Convert consecutive <br> tags into paragraphs
    html = html.split(/(<br>\s*){2,}/).map(p => p.trim() ? `<p>${p.replace(/^(<br>\s*)+|(<br>\s*)+$/g, '')}</p>` : '').join('');
    // Cleanup paragraphs around block elements
    html = html.replace(/<p>(<(pre|blockquote|ul|ol|h[1-3]))/g, '$1').replace(/(<\/(pre|blockquote|ul|ol|h[1-3])>)<\/p>/g, '$1');

    return `<div class='prose prose-sm dark:prose-invert max-w-none'>${html}</div>`;
};


export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = "400px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [renderedHtml, setRenderedHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === "preview") {
      setRenderedHtml(markdownToHtml(value));
    }
  }, [value, activeTab]);

  const insertMarkdown = (before: string, after = "", placeholderText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholderText;
    const newText =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + textToInsert.length,
      );
    }, 0);
  };

  const toolbarButtons = [
    { label: "H1", action: () => insertMarkdown("# ", "", "Heading 1"), icon: <Heading1 className="size-4"/> },
    { label: "H2", action: () => insertMarkdown("## ", "", "Heading 2"), icon: <Heading2 className="size-4"/> },
    { label: "H3", action: () => insertMarkdown("### ", "", "Heading 3"), icon: <Heading3 className="size-4"/> },
    { label: "Bold", action: () => insertMarkdown("**", "**", "bold text"), icon: <Bold className="size-4"/> },
    { label: "Italic", action: () => insertMarkdown("*", "*", "italic text"), icon: <Italic className="size-4"/> },
    { label: "Code", action: () => insertMarkdown("`", "`", "inline code"), icon: <Code className="size-4"/> },
    { label: "Code Block", action: () => insertMarkdown("```\n", "\n```", "code block"), icon: <CodeSquare className="size-4"/> },
    { label: "Link", action: () => insertMarkdown("[", "](url)", "link text"), icon: <LinkIcon className="size-4"/> },
    { label: "Image", action: () => insertMarkdown("![alt text](", ")", "image url"), icon: <ImageIcon className="size-4"/> },
    { label: "List", action: () => insertMarkdown("\n- ", "", "List item"), icon: <List className="size-4"/> },
    { label: "Quote", action: () => insertMarkdown("\n> ", "", "Quote"), icon: <Quote className="size-4"/> },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col items-stretch gap-2 border-b border-border bg-muted/50 p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              type="button"
              variant="ghost"
              size="icon"
              onClick={button.action}
              className="h-8 w-8"
              title={button.label}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <div className="flex self-end rounded-md border bg-background p-0.5 sm:self-center">
          <Button
            type="button"
            variant={activeTab === 'write' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab("write")}
            className="flex-1"
          >
            Write
          </Button>
          <Button
            type="button"
            variant={activeTab === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab("preview")}
            className="flex-1"
          >
            Preview
          </Button>
        </div>
      </div>

      <div style={{ height }}>
        {activeTab === "write" ? (
          <textarea
            id="markdown-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full resize-none rounded-b-md border-none bg-card p-4 font-mono text-sm text-foreground focus:outline-none"
            spellCheck="false"
          />
        ) : (
          <div
            className="h-full overflow-auto bg-card p-4 text-foreground"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>

      <div className="border-t border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Markdown supported</span>
          <span>{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}