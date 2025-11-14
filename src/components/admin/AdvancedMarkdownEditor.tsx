
import React, { useState, useEffect } from "react";
import MarkdownEditor from "@/components/admin/markdown-editor";
import { Expand, Shrink, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
  minHeight = "300px",
}: AdvancedMarkdownEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        isFullScreen && "fixed inset-0 z-50 flex flex-col",
      )}
    >
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
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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
      <div className={cn("relative", isFullScreen && "flex-grow")}>
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder="Write your amazing blog post here..."
          height={isFullScreen ? "100%" : minHeight}
        />
      </div>
    </div>
  );
}