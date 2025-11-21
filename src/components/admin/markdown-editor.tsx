"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { Button } from "../ui/button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const markdownToHtml = (markdown: string): string => {
  if (typeof window === "undefined" || !DOMPurify.sanitize) {
    return markdown; // Fallback for SSR
  }
  let html = DOMPurify.sanitize(markdown)
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, "<strong>$1$2</strong>")
    .replace(/\*(.*?)\*|_(.*?)_/gim, "<em>$1$2</em>")
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/gim,
      '<img src="$2" alt="$1" loading="lazy" />',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(
      /```([\s\S]*?)```/gim,
      (match, p1) =>
        `<pre><code>${p1.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`,
    )
    .replace(/`(.*?)`/gim, "<code>$1</code>")
    .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/^\s*([-*+]) (.*)/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>)/gm, "<ul>$1</ul>")
    .replace(/<\/ul>\s*<ul>/g, "")
    .replace(/^\s*(\d+\.) (.*)/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>)/gm, "<ol>$1</ol>")
    .replace(/<\/ol>\s*<ol>/g, "")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
  return `<div class="prose prose-sm dark:prose-invert max-w-none">${html}</div>`;
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
    { label: "H1", action: () => insertMarkdown("# ", "", "H1"), icon: "H1" },
    { label: "H2", action: () => insertMarkdown("## ", "", "H2"), icon: "H2" },
    { label: "H3", action: () => insertMarkdown("### ", "", "H3"), icon: "H3" },
    {
      label: "Bold",
      action: () => insertMarkdown("**", "**", "bold"),
      icon: "B",
    },
    {
      label: "Italic",
      action: () => insertMarkdown("*", "*", "italic"),
      icon: "I",
    },
    {
      label: "Code",
      action: () => insertMarkdown("`", "`", "code"),
      icon: "</>",
    },
    {
      label: "Block",
      action: () => insertMarkdown("```\n", "\n```", "block"),
      icon: "{}",
    },
    {
      label: "Link",
      action: () => insertMarkdown("[", "](url)", "link"),
      icon: "🔗",
    },
    {
      label: "Image",
      action: () => insertMarkdown("![alt](", ")", "url"),
      icon: "🖼️",
    },
    {
      label: "List",
      action: () => insertMarkdown("- ", "", "item"),
      icon: "•",
    },
    {
      label: "Quote",
      action: () => insertMarkdown("> ", "", "quote"),
      icon: "❝",
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
      <div className="flex flex-col items-stretch gap-2 border-b bg-secondary/50 p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              type="button"
              onClick={button.action}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title={button.label}
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <div className="flex self-end rounded-md border bg-secondary p-0.5">
          <Button
            type="button"
            onClick={() => setActiveTab("write")}
            variant={activeTab === "write" ? "secondary" : "ghost"}
            size="sm"
            className="h-7"
          >
            Write
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab("preview")}
            variant={activeTab === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7"
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
            className="h-full w-full resize-none rounded-b-lg border-none bg-card p-4 font-mono text-sm text-card-foreground focus:outline-none"
            spellCheck="false"
          />
        ) : (
          <div
            className="h-full overflow-auto p-4"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>

      <div className="border-t bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Markdown supported</span>
          <span className="font-semibold">{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}
