"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

// This markdown parser is a simple RegExp-based one. For more complex needs (like nested lists),
// a library like 'marked' or 'react-markdown' might be better, but this is fast and lightweight.
const markdownToHtml = (markdown: string): string => {
  if (typeof window === 'undefined' || !DOMPurify.sanitize) {
    return markdown; // Basic fallback for SSR or if DOMPurify isn't ready
  }
  const sanitizedMarkdown = DOMPurify.sanitize(markdown);

  let html = sanitizedMarkdown
    .replace(/^# (.*$)/gim, "<h1 class='text-3xl font-bold my-4 '>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2 class='text-2xl font-bold my-3 '>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3 class='text-xl font-bold my-2 '>$1</h3>")
    .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, "<strong class=''>$1$2</strong>")
    .replace(/\*(.*?)\*|_(.*?)_/gim, "<em class=''>$1$2</em>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" loading="lazy" class="max-w-full h-auto my-3 border-2 border-black rounded-none" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-semibold ">$1</a>')
    .replace(/```([\s\S]*?)```/gim, (match, p1) => `<pre class='bg-gray-800 text-white p-3 my-3 border-2 border-black rounded-none overflow-x-auto font-mono text-sm'><code class='font-mono'>${p1.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
    .replace(/`(.*?)`/gim, "<code class='bg-gray-200 text-red-600 px-1 py-0.5 font-mono text-sm border border-black rounded-none'>$1</code>")
    .replace(/^\> (.*$)/gim, "<blockquote class='border-l-4 border-black pl-4 py-2 my-3 bg-gray-100 italic  rounded-none'>$1</blockquote>")
    // Convert list items, then wrap them in ul/ol
    .replace(/^\s*([-*+]) (.*)/gm, "<li>$2</li>")
    .replace(/^\s*(\d+\.) (.*)/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>)/gm, (match) => {
        // Naive check if it looks like an ordered list
        if (match.match(/^\d+\./)) {
            return `<ol class='list-decimal list-inside my-4 pl-4 '>${match}</ol>`;
        }
        return `<ul class='list-disc list-inside my-4 pl-4 '>${match}</ul>`;
    })
    // Consolidate adjacent lists
    .replace(/<\/ul>\s*<ul class='list-disc list-inside my-4 pl-4 '>/g, '')
    .replace(/<\/ol>\s*<ol class='list-decimal list-inside my-4 pl-4 '>/g, '')
    // Paragraphs and line breaks
    .replace(/\n\n/g, "</p><p class='my-2 '>")
    .replace(/\n/g, "<br />");

  // Final cleanup
  if (!html.trim().startsWith("<")) {
    html = "<p class='my-2 '>" + html;
  }
  if (!html.trim().endsWith("</p>")) {
    html = html + "</p>";
  }
  
  html = "<div class='markdown-preview-content '>" + html + "</div>";
  html = html.replace(/<p class='my-2 '>\s*(<br\s*\/?>\s*)*\s*<\/p>/g, "").replace(/(<br\s*\/?>\s*){3,}/g, "<br /><br />");

  return html;
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
    { label: "Bold", action: () => insertMarkdown("**", "**", "bold"), icon: "B" },
    { label: "Italic", action: () => insertMarkdown("*", "*", "italic"), icon: "I" },
    { label: "Code", action: () => insertMarkdown("`", "`", "code"), icon: "</>" },
    { label: "Block", action: () => insertMarkdown("```\n", "\n```", "block"), icon: "{}" },
    { label: "Link", action: () => insertMarkdown("[", "](url)", "link"), icon: "🔗" },
    { label: "Image", action: () => insertMarkdown("![alt](", ")", "url"), icon: "🖼️" },
    { label: "List", action: () => insertMarkdown("- ", "", "item"), icon: "•" },
    { label: "Quote", action: () => insertMarkdown("> ", "", "quote"), icon: "❝" },
  ];

  return (
    <div className="overflow-hidden rounded-none border-2 border-black bg-white ">
      <div className="border-b-2 border-black bg-gray-100 p-2">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {toolbarButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={button.action}
                className="rounded-none border border-black bg-white px-2 py-1  text-xs font-bold shadow-[1px_1px_0_#000] transition-colors hover:bg-gray-200 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
                title={button.label}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="flex self-end rounded-none border-2 border-black bg-white sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-3 py-1  text-sm font-bold transition-colors ${
                activeTab === "write"
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-200"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`border-l-2 border-black px-3 py-1  text-sm font-bold transition-colors ${
                activeTab === "preview"
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-200"
              }`}
            >
              Preview
            </button>
          </div>
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
            className="w-full h-full resize-none rounded-none border-none bg-white p-4 font-mono text-sm text-black focus:outline-none"
            spellCheck="false"
          />
        ) : (
          <div
            className="h-full overflow-auto bg-white p-4  text-black"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            style={{ lineHeight: "1.6" }}
          />
        )}
      </div>

      <div className="border-t-2 border-black bg-gray-100 px-4 py-2 text-xs text-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Markdown supported</span>
          <span className="font-semibold">{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}