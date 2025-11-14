
/*
This file is updated for the neo-brutalist style.
- `ResizablePanelGroup` now has a thick `border-2` and `rounded-none` styling. The subtle modern look is removed.
- `ResizableHandle` is made more prominent. The subtle line is replaced with a thicker element, and the hover/drag states are more pronounced, using a solid color.
- The handle's grabber icon container is updated with `border-2` and `rounded-none`.
*/
"use client";

import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full rounded-none border-2 border-black data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = ResizablePrimitive.Panel;
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-1.5 items-center justify-center bg-transparent after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-0.5 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      "after:bg-black",
      "data-[resize-handle-state=hover]:after:bg-yellow-400 data-[resize-handle-state=drag]:after:bg-yellow-500",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-none border-2 border-black bg-white">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };