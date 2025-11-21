// src/components/admin/learning/TopicEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import type { LearningTopic, LearningStatus } from "@/types";
import { useSaveTopicMutation } from "@/store/api/adminApi";
import AdvancedMarkdownEditor from "@/components/admin/AdvancedMarkdownEditor";
import SessionTracker from "./SessionTracker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Trash2, Plus } from "lucide-react";

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

  const [saveTopic, { isLoading: isSaving }] = useSaveTopicMutation();

  useEffect(() => {
    if (topic) {
      setCoreNotes(topic.core_notes || "");
      setStatus(topic.status || "To Learn");
      setResources(topic.resources || []);
    }
  }, [topic]);

  // Use useCallback to memoize the function
  const handleSave = React.useCallback(
    async (updateData: Partial<LearningTopic>, isAutosave: boolean = false) => {
      if (!topic) return;
      try {
        const updatedTopic = await saveTopic({
          id: topic.id,
          ...updateData,
        }).unwrap();
        if (!isAutosave) toast.success("Topic updated successfully!");
        else console.log("Autosaved notes.");
        onTopicUpdate(updatedTopic);
      } catch (err: any) {
        toast.error("Failed to save topic", { description: err.message });
      }
    },
    [topic, saveTopic, onTopicUpdate],
  );

  useEffect(() => {
    if (!topic || coreNotes === (topic.core_notes || "")) return;

    const handler = setTimeout(() => {
      handleSave({ core_notes: coreNotes }, true);
    }, 2000);

    return () => clearTimeout(handler);
  }, [coreNotes, topic, handleSave]); // Added handleSave to dependency array

  const handleStatusChange = (newStatus: LearningStatus) => {
    setStatus(newStatus);
    handleSave({ status: newStatus });
  };

  const handleResourceChange = (
    index: number,
    field: "name" | "url",
    value: string,
  ) => {
    const newResources = JSON.parse(JSON.stringify(resources));
    newResources[index][field] = value;
    setResources(newResources);
  };

  const addResource = () => setResources([...resources, { name: "", url: "" }]);
  const removeResource = (index: number) =>
    setResources(resources.filter((_, i) => i !== index));

  if (!topic) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <Label htmlFor="status-select">Status</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Learn">To Learn</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Practicing">Practicing</SelectItem>
              <SelectItem value="Mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        {topic.title}
      </h2>
      <SessionTracker topic={topic} />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Resources</h4>
        <div className="rounded-lg border bg-card/50 p-4">
          <div className="space-y-3">
            {resources.map((res, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-grow rounded-md border bg-background px-3 py-2">
                  <Input
                    className="h-auto border-0 p-0 text-sm font-semibold focus-visible:ring-0"
                    placeholder="Resource Name"
                    value={res.name}
                    onChange={(e) =>
                      handleResourceChange(index, "name", e.target.value)
                    }
                  />
                  <Input
                    className="h-auto border-0 p-0 text-xs text-muted-foreground focus-visible:ring-0"
                    placeholder="https://example.com"
                    value={res.url}
                    onChange={(e) =>
                      handleResourceChange(index, "url", e.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResource(index)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t">
            <Button variant="outline" size="sm" onClick={addResource}>
              <Plus className="mr-2 size-4" />
              Add Resource
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave({ resources })}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Resources
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold">Core Notes</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Your permanent knowledge base for this topic. Notes are auto-saved.
        </p>
        <AdvancedMarkdownEditor
          value={coreNotes}
          onChange={setCoreNotes}
          onImageUploadRequest={() =>
            toast.info("Image upload for learning notes is coming soon!")
          }
          minHeight="500px"
        />
        {isSaving && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="size-3 animate-spin" />
            Saving...
          </p>
        )}
      </div>
    </div>
  );
}
