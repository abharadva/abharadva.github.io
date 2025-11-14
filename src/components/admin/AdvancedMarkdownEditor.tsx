import React, { useState, useEffect } from "react";
import MarkdownEditor from "@/components/admin/markdown-editor";
import { Expand, Shrink } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "rounded-none border-2 border-black  bg-white",
        isFullScreen && "fixed inset-0 z-50 flex flex-col",
      )}
    >
      <div className="flex flex-col items-stretch gap-2 border-b-2 border-black bg-gray-100 p-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-black">
          Markdown Editor
        </span>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onImageUploadRequest}
            className="w-full flex-1 rounded-none border-2 border-black bg-blue-500 px-3 py-1  text-xs text-white shadow-[2px_2px_0px_#000] transition-all hover:bg-blue-600 active:translate-x-px active:translate-y-px active:shadow-none sm:w-auto sm:flex-initial"
          >
            Upload Image to Content
          </button>
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="rounded-none border-2 border-black bg-gray-300 p-1.5 text-black shadow-[2px_2px_0px_#000] transition-all hover:bg-gray-400 active:translate-x-px active:translate-y-px active:shadow-none"
          >
            {isFullScreen ? (
              <Shrink className="size-3.5" />
            ) : (
              <Expand className="size-3.5" />
            )}
            <span className="sr-only">
              {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </span>
          </button>
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