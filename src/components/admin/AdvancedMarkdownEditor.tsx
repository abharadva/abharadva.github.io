// src/components/admin/AdvancedMarkdownEditor.tsx
import React, { useState, useEffect } from "react";
import {
  Expand,
  Shrink,
  ImageIcon,
  Eye,
  PenLine,
  Code,
  Heading1,
  List,
  Quote,
  Bold,
  Italic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";

interface AdvancedMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUploadRequest: () => void;
  minHeight?: string;
}

export default function AdvancedMarkdownEditor({
  value,
  onChange,
  onImageUploadRequest,
  minHeight = "500px",
}: AdvancedMarkdownEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("write");

  // Handle fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // Helper to insert markdown syntax
  const insertSyntax = (prefix: string, suffix = "") => {
    const textarea = document.querySelector(
      "textarea.editor-textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      text.substring(end);

    onChange(newText);

    // Wait for render then restore focus/selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200",
        isFullScreen
          ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0"
          : "w-full",
      )}
      style={{ height: isFullScreen ? "100vh" : minHeight }}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex h-full flex-col"
      >
        {/* Toolbar Header */}
        <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-4">
            <TabsList className="h-8">
              <TabsTrigger value="write" className="h-7 gap-2 text-xs">
                <PenLine className="size-3.5" /> Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-7 gap-2 text-xs">
                <Eye className="size-3.5" /> Preview
              </TabsTrigger>
            </TabsList>

            <div className="hidden h-4 w-px bg-border sm:block" />

            {/* Formatting Tools (Visible only in Write mode) */}
            {activeTab === "write" && (
              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("# ")}
                  title="Heading 1"
                >
                  <Heading1 className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("**", "**")}
                  title="Bold"
                >
                  <Bold className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("_", "_")}
                  title="Italic"
                >
                  <Italic className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("```\n", "\n```")}
                  title="Code Block"
                >
                  <Code className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("> ")}
                  title="Quote"
                >
                  <Quote className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertSyntax("- ")}
                  title="List"
                >
                  <List className="size-4 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onImageUploadRequest}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={activeTab !== "write"}
            >
              <ImageIcon className="mr-2 size-3.5" />
              Add Image
            </Button>
            <Button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? (
                <Shrink className="size-4" />
              ) : (
                <Expand className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden bg-background">
          <TabsContent
            value="write"
            className="absolute inset-0 m-0 h-full w-full p-0 data-[state=inactive]:hidden"
          >
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Start writing your masterpiece..."
              className="editor-textarea h-full w-full resize-none rounded-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus-visible:ring-0"
            />
          </TabsContent>

          <TabsContent
            value="preview"
            className="absolute inset-0 m-0 h-full w-full overflow-y-auto bg-muted/10 p-8 data-[state=inactive]:hidden"
          >
            <div
              className="prose max-w-3xl mx-auto dark:prose-invert
                prose-headings:font-bold prose-headings:tracking-tight
                prose-p:leading-7 
                prose-a:text-primary hover:prose-a:text-primary/80
                prose-pre:bg-muted prose-pre:border
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none
                prose-img:rounded-lg prose-img:border prose-img:shadow-sm"
            >
              {value ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypePrism]}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <Eye className="mb-2 size-10 opacity-20" />
                  <p className="italic">Nothing to preview yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
