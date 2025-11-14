import React, { useState, useEffect } from 'react';
import { Expand, Shrink, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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
  minHeight = '400px',
}: AdvancedMarkdownEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card',
        isFullScreen && 'fixed inset-0 z-50 flex flex-col bg-background'
      )}
      style={{ height: isFullScreen ? '100vh' : 'auto' }}
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
            title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
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
              {isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </span>
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-grow" style={{ minHeight }}>
        <ResizablePanel defaultSize={50}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your amazing blog post here..."
            className="h-full w-full resize-none rounded-bl-lg border-none bg-card p-4 font-mono text-sm text-card-foreground focus:outline-none"
            spellCheck="false"
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-full">
            <div className="prose dark:prose-invert max-w-none p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={materialDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {value}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}