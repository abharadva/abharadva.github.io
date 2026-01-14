// src/components/admin/learning/TopicEditor.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { LearningTopic, LearningStatus } from "@/types";
import { useSaveTopicMutation } from "@/store/api/adminApi";
import AdvancedMarkdownEditor from "@/components/admin/AdvancedMarkdownEditor";
import SessionTracker from "./SessionTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Plus,
  Link as LinkIcon,
  Video,
  FileText,
  Globe,
  GraduationCap,
  Hourglass,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- COMPONENTS (No changes here, keeping them for context) ---

const STATUS_STEPS: { value: LearningStatus; label: string }[] = [
  { value: "To Learn", label: "Queue" },
  { value: "Learning", label: "Learning" },
  { value: "Practicing", label: "Practicing" },
  { value: "Mastered", label: "Mastered" },
];

const StatusPipeline = ({
  current,
  onChange,
}: {
  current: LearningStatus;
  onChange: (s: LearningStatus) => void;
}) => (
  <div className="flex items-center p-1 bg-secondary/40 rounded-lg border border-border/50">
    {STATUS_STEPS.map((step) => {
      const isActive = current === step.value;
      return (
        <button
          key={step.value}
          onClick={() => onChange(step.value)}
          className={cn(
            "relative px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-all duration-200",
            isActive
              ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground/80 hover:bg-background/40",
          )}
        >
          {step.label}
        </button>
      );
    })}
  </div>
);

const parseResource = (rawText: string | undefined | null) => {
  if (!rawText) return { type: "Link", title: "Untitled Resource" };
  const types = [
    "Article",
    "Video",
    "Course",
    "Official",
    "Roadmap",
    "OpenSource",
  ];
  for (const type of types) {
    if (rawText.startsWith(type)) {
      return { type, title: rawText.substring(type.length).trim() };
    }
  }
  return { type: "Link", title: rawText };
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case "Video":
      return <Video className="size-3.5 text-red-500" />;
    case "Article":
      return <FileText className="size-3.5 text-blue-500" />;
    case "Course":
      return <GraduationCap className="size-3.5 text-green-500" />;
    case "Official":
      return <Globe className="size-3.5 text-sky-500" />;
    case "OpenSource":
      return <Globe className="size-3.5 text-purple-500" />;
    default:
      return <LinkIcon className="size-3.5 text-muted-foreground" />;
  }
};

const ResourceCard = ({
  resource,
  onDelete,
}: {
  resource: { name: string; url: string };
  onDelete: () => void;
}) => {
  const { type, title } = parseResource(resource.name);
  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm hover:border-primary/20 transition-all duration-200">
      <div className="mt-0.5 shrink-0 size-8 flex items-center justify-center bg-background rounded-lg border border-border shadow-sm">
        {getResourceIcon(type)}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge
            variant="secondary"
            className="text-[9px] h-4 px-1 rounded-[4px] font-mono font-normal uppercase tracking-wider text-muted-foreground/80"
          >
            {type}
          </Badge>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="block font-medium text-xs sm:text-sm leading-snug hover:text-primary hover:underline"
        >
          {title || resource.name}
        </a>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/60">
          <ExternalLink className="size-2.5" />
          <span className="truncate max-w-[150px]">
            {resource.url ? new URL(resource.url).hostname : "No URL"}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1.5 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface TopicEditorProps {
  topic: LearningTopic | null;
  onBack: () => void;
  onTopicUpdate: (updatedTopic: LearningTopic) => void;
}

export default function TopicEditor({
  topic,
  onBack,
  onTopicUpdate,
}: TopicEditorProps) {
  const [coreNotes, setCoreNotes] = useState("");
  const [status, setStatus] = useState<LearningStatus>("To Learn");
  const [resources, setResources] = useState<{ name: string; url: string }[]>(
    [],
  );
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResName, setNewResName] = useState("");
  const [newResUrl, setNewResUrl] = useState("");

  const [saveTopic, { isLoading: isSaving }] = useSaveTopicMutation();

  useEffect(() => {
    if (topic) {
      setCoreNotes(topic.core_notes || "");
      setStatus(topic.status || "To Learn");
      const rawResources = topic.resources || [];
      const normalizedResources = rawResources.map((res: any) => ({
        name: res.name || res.text || "Untitled Resource",
        url: res.url || "",
      }));
      setResources(normalizedResources);
    }
  }, [topic]);

  const handleSave = useCallback(
    async (updateData: Partial<LearningTopic>, isAutosave = false) => {
      if (!topic) return;
      try {
        const updatedTopic = await saveTopic({
          id: topic.id,
          ...updateData,
        }).unwrap();
        if (!isAutosave) toast.success("Topic saved");
        onTopicUpdate(updatedTopic);
      } catch (err: any) {
        toast.error("Failed to save", { description: err.message });
      }
    },
    [topic, saveTopic, onTopicUpdate],
  );

  useEffect(() => {
    if (!topic || coreNotes === (topic.core_notes || "")) return;
    const handler = setTimeout(
      () => handleSave({ core_notes: coreNotes }, true),
      3000,
    );
    return () => clearTimeout(handler);
  }, [coreNotes, topic, handleSave]);

  const handleStatusChange = (newStatus: LearningStatus) => {
    setStatus(newStatus);
    handleSave({ status: newStatus });
  };
  const handleAddResource = () => {
    if (!newResName || !newResUrl) return;
    const updatedResources = [
      ...resources,
      { name: newResName, url: newResUrl },
    ];
    setResources(updatedResources);
    handleSave({ resources: updatedResources });
    setNewResName("");
    setNewResUrl("");
    setIsAddResourceOpen(false);
  };
  const handleDeleteResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    handleSave({ resources: updatedResources });
  };

  if (!topic) return null;

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate tracking-tight">
                {topic.title}
              </h1>
              {isSaving && (
                <span className="text-[10px] text-primary animate-pulse font-mono">
                  SAVING...
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              LAST EDITED:{" "}
              {formatDate(new Date(topic.updated_at || new Date()))}
            </p>
          </div>
        </div>
        <StatusPipeline current={status} onChange={handleStatusChange} />
      </header>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
          <div className="absolute inset-0 overflow-hidden">
            <AdvancedMarkdownEditor
              value={coreNotes}
              onChange={setCoreNotes}
              onImageUploadRequest={() =>
                toast.info("Image upload coming soon.")
              }
              minHeight="100%"
            />
          </div>
        </div>
        <div className="w-full lg:w-[380px] bg-muted/5 border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <section className="bg-gradient-to-br from-background to-secondary/30 rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Hourglass className="size-3.5" /> Study Timer
                </div>
                <SessionTracker topic={topic} />
              </section>
              <Separator />
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Layers className="size-3.5" /> Resources{" "}
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4 min-w-[20px] justify-center px-1"
                    >
                      {resources.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsAddResourceOpen(true)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {resources.map((res, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      >
                        <ResourceCard
                          resource={res}
                          onDelete={() => handleDeleteResource(i)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {resources.length === 0 && (
                    <div
                      onClick={() => setIsAddResourceOpen(true)}
                      className="border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all group"
                    >
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <LinkIcon className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        Empty Library
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Add links, docs, or videos.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resource Title</Label>
              <Input
                placeholder="e.g. Video: React Hooks Explained"
                value={newResName}
                onChange={(e) => setNewResName(e.target.value)}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">
                Prefix with <strong>Article</strong>, <strong>Video</strong>,
                etc. to auto-assign an icon.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                placeholder="https://..."
                value={newResUrl}
                onChange={(e) => setNewResUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddResourceOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddResource}
              disabled={!newResName || !newResUrl}
            >
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
