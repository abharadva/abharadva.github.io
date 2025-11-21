import React, { useState, useEffect } from "react";
import { Expand, Shrink, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
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
  minHeight = "400px",
}: AdvancedMarkdownEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const editorHeight = isFullScreen ? "calc(100vh - 60px)" : minHeight;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        isFullScreen && "fixed inset-0 z-50 flex flex-col bg-background",
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-col items-stretch gap-2 border-b bg-secondary/50 p-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
          Markdown Editor
        </span>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            type="button"
            onClick={onImageUploadRequest}
            variant="ghost"
            size="sm"
          >
            <ImageIcon className="mr-2 size-4" />
            Upload Image
          </Button>
          <Button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            {isFullScreen ? (
              <Shrink className="size-4" />
            ) : (
              <Expand className="size-4" />
            )}
            <span className="sr-only">
              {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </span>
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        className={cn("relative", isFullScreen && "flex-grow overflow-hidden")}
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full rounded-b-lg"
        >
          <ResizablePanel defaultSize={50}>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your amazing blog post here..."
              className="h-full w-full resize-none rounded-none border-0 bg-background p-4 font-mono text-sm focus-visible:ring-0"
              style={{ height: editorHeight }}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div
              className="prose dark:prose-invert max-w-none h-full overflow-y-auto p-4"
              style={{ height: editorHeight }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypePrism]}
              >
                {value}
              </ReactMarkdown>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
