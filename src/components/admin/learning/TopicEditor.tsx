// src/components/admin/learning/TopicEditor.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { LearningTopic, LearningStatus } from "@/types";
import { useSaveTopicMutation, useGetLearningDataQuery } from "@/store/api/adminApi";
import AdvancedMarkdownEditor from "@/components/admin/AdvancedMarkdownEditor";
import SessionTracker from "./SessionTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  Plus, 
  ExternalLink, 
  BookOpen, 
  History, 
  Link as LinkIcon,
  Calendar,
  Clock,
  CheckCircle2,
  Globe,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// --- SUB-COMPONENTS ---

// 1. VISUAL STATUS PIPELINE
const STATUS_STEPS: { value: LearningStatus; label: string }[] = [
  { value: "To Learn", label: "To Learn" },
  { value: "Learning", label: "Learning" },
  { value: "Practicing", label: "Practicing" },
  { value: "Mastered", label: "Mastered" },
];

const StatusPipeline = ({ current, onChange }: { current: LearningStatus, onChange: (s: LearningStatus) => void }) => {
  return (
    <div className="flex items-center bg-secondary/30 p-1 rounded-full border border-border w-fit relative isolate">
       {STATUS_STEPS.map((step) => {
         const isActive = current === step.value;
         return (
           <button
             key={step.value}
             onClick={() => onChange(step.value)}
             className={cn(
               "relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 flex items-center gap-1.5",
               isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
             )}
           >
             {isActive && (
               <motion.div
                 layoutId="activeStatusPill"
                 className="absolute inset-0 bg-background rounded-full shadow-sm -z-10 border border-border/50"
                 transition={{ type: "spring", stiffness: 350, damping: 30 }}
               />
             )}
             {isActive && <CheckCircle2 className="size-3 text-primary" />}
             <span className="relative">{step.label}</span>
           </button>
         )
       })}
    </div>
  );
};

// 2. CONFIDENCE METER
const CONFIDENCE_LEVELS = [
  { label: "UNKNOWN", color: "bg-muted" },
  { label: "NOVICE", color: "bg-red-500" },
  { label: "BEGINNER", color: "bg-orange-500" },
  { label: "COMPETENT", color: "bg-yellow-500" },
  { label: "PROFICIENT", color: "bg-blue-500" },
  { label: "EXPERT", color: "bg-green-500" },
];

const ConfidenceMeter = ({ score, onChange }: { score: number, onChange: (s: number) => void }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeScore = hovered !== null ? hovered : score;
  const currentLevel = CONFIDENCE_LEVELS[activeScore] || CONFIDENCE_LEVELS[0];

  return (
    <div className="flex flex-col items-end gap-1">
       <div className="flex items-center gap-[2px]" onMouseLeave={() => setHovered(null)}>
         {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => onChange(level)}
              onMouseEnter={() => setHovered(level)}
              className={cn(
                 "w-1.5 h-5 rounded-sm transition-all duration-200",
                 level <= activeScore ? currentLevel.color : "bg-secondary"
              )}
            />
         ))}
       </div>
       <span className="text-[10px] font-bold text-muted-foreground tracking-widest">
          {currentLevel.label}
       </span>
    </div>
  );
};

// 3. RESOURCE CARD
const ResourceCard = ({ 
  resource, 
  onDelete, 
  onEdit 
}: { 
  resource: { name: string; url: string }; 
  onDelete: () => void; 
  onEdit: (newName: string, newUrl: string) => void 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(resource.name);
  const [editUrl, setEditUrl] = useState(resource.url);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const handleSave = () => {
    onEdit(editName, editUrl);
    setIsEditing(false);
  }

  if (isEditing) {
     return (
        <Card className="border-dashed border-primary/50 bg-primary/5">
            <CardContent className="p-3 space-y-3">
                <div className="space-y-1">
                   <Label className="text-xs">Title</Label>
                   <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 bg-background" autoFocus />
                </div>
                <div className="space-y-1">
                   <Label className="text-xs">URL</Label>
                   <Input value={editUrl} onChange={e => setEditUrl(e.target.value)} className="h-8 bg-background font-mono text-xs" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7">Cancel</Button>
                    <Button size="sm" onClick={handleSave} className="h-7">Update</Button>
                </div>
            </CardContent>
        </Card>
     )
  }

  const favicon = getFavicon(resource.url);

  return (
    <div className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
       <div className="h-10 w-10 rounded-md bg-secondary/40 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
          {favicon ? (
            <img src={favicon} alt="" className="w-5 h-5 object-contain opacity-80" />
          ) : (
            <Globe className="size-5 text-muted-foreground" />
          )}
       </div>
       
       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <h4 className="font-medium text-sm truncate text-foreground">{resource.name}</h4>
          </div>
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-muted-foreground hover:text-primary truncate block font-mono mt-0.5"
          >
            {resource.url}
          </a>
       </div>

       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-card shadow-sm border rounded-md p-0.5">
           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
              <Pencil className="size-3.5 text-muted-foreground" />
           </Button>
           <div className="w-px h-4 bg-border" />
           <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={onDelete}>
              <Trash2 className="size-3.5" />
           </Button>
       </div>
    </div>
  )
}

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
  const [confidence, setConfidence] = useState<number>(1);
  const [resources, setResources] = useState<{ name: string; url: string }[]>([]);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResName, setNewResName] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  
  const { data: learningData } = useGetLearningDataQuery();
  const topicSessions = learningData?.sessions.filter(s => s.topic_id === topic?.id) || [];
  
  const [saveTopic, { isLoading: isSaving }] = useSaveTopicMutation();

  useEffect(() => {
    if (topic) {
      setCoreNotes(topic.core_notes || "");
      setStatus(topic.status || "To Learn");
      setConfidence(topic.confidence_score || 1);
      setResources(topic.resources || []);
    }
  }, [topic]);

  const handleSave = useCallback(
    async (updateData: Partial<LearningTopic>, isAutosave: boolean = false) => {
      if (!topic) return;
      try {
        const updatedTopic = await saveTopic({
          id: topic.id,
          ...updateData,
        }).unwrap();
        if (!isAutosave) toast.success("Saved");
        onTopicUpdate(updatedTopic);
      } catch (err: any) {
        toast.error("Failed to save", { description: err.message });
      }
    },
    [topic, saveTopic, onTopicUpdate],
  );

  // Autosave Notes
  useEffect(() => {
    if (!topic || coreNotes === (topic.core_notes || "")) return;
    const handler = setTimeout(() => {
      handleSave({ core_notes: coreNotes }, true);
    }, 2000);
    return () => clearTimeout(handler);
  }, [coreNotes, topic, handleSave]);

  const handleStatusChange = (newStatus: LearningStatus) => {
    setStatus(newStatus);
    handleSave({ status: newStatus });
  };
  
  const handleConfidenceChange = (score: number) => {
    setConfidence(score);
    handleSave({ confidence_score: score });
  }

  const handleAddResource = () => {
     if(!newResName || !newResUrl) return;
     const updatedResources = [...resources, { name: newResName, url: newResUrl }];
     setResources(updatedResources);
     handleSave({ resources: updatedResources });
     setNewResName("");
     setNewResUrl("");
     setIsAddResourceOpen(false);
  }

  const handleUpdateResource = (index: number, name: string, url: string) => {
    const updatedResources = [...resources];
    updatedResources[index] = { name, url };
    setResources(updatedResources);
    handleSave({ resources: updatedResources }, true);
  }

  const handleDeleteResource = (index: number) => {
     const updatedResources = resources.filter((_, i) => i !== index);
     setResources(updatedResources);
     handleSave({ resources: updatedResources });
  }

  if (!topic) return null;

  const totalTime = topicSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* --- HEADER --- */}
      <header className="backdrop-blur-sm border-b pb-6 mb-4 shrink-0 sticky top-0 z-20 space-y-6">
        <div className="flex items-center justify-between">
             <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground group" onClick={onBack}>
                <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" /> Back
             </Button>
             <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                 <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                    <Clock className="size-3.5" />
                    <span>{hours}h {minutes}m</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>Updated: {formatDate(new Date(topic.updated_at || new Date()))}</span>
                </div>
             </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight text-foreground">{topic.title}</h2>
                <StatusPipeline current={status} onChange={handleStatusChange} />
            </div>
            <div className="pb-1">
                <ConfidenceMeter score={confidence} onChange={handleConfidenceChange} />
            </div>
        </div>
      </header>

      {/* --- TABS & CONTENT --- */}
      <Tabs defaultValue="study" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b bg-background/50">
            <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-6">
                <TabsTrigger value="study" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none px-2 py-3 transition-all hover:text-foreground/80">
                    <BookOpen className="mr-2 size-4" /> Study
                </TabsTrigger>
                <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none px-2 py-3 transition-all hover:text-foreground/80">
                    <LinkIcon className="mr-2 size-4" /> Resources 
                    {resources.length > 0 && <span className="ml-2 text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">{resources.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent shadow-none px-2 py-3 transition-all hover:text-foreground/80">
                    <History className="mr-2 size-4" /> History
                </TabsTrigger>
            </TabsList>
            <div className="px-4 hidden md:block">
                 {isSaving && <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Saving...</span>}
            </div>
        </div>

        {/* TAB: STUDY */}
        <TabsContent value="study" className="flex flex-col gap-6 mt-6 min-h-0 overflow-y-auto pr-2 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
           <div className="shrink-0 grid grid-cols-1">
              <SessionTracker topic={topic} />
           </div>
           
           <div className="shrink-0 flex flex-col rounded-lg border bg-card/50 shadow-sm h-[600px] mb-6">
              <div className="flex items-center justify-between p-3 border-b bg-muted/20">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pl-2">
                    <BookOpen className="size-3.5"/> Core Notes
                  </Label>
              </div>
              <div className="flex-1 overflow-hidden">
                  <AdvancedMarkdownEditor
                    value={coreNotes}
                    onChange={setCoreNotes}
                    onImageUploadRequest={() => toast.info("Image upload for learning notes coming soon")}
                    minHeight="100%"
                  />
              </div>
           </div>
        </TabsContent>

        {/* TAB: RESOURCES */}
        <TabsContent value="resources" className="mt-6 overflow-y-auto pr-2 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
             <div className="max-w-5xl mx-auto">
                 <div className="flex justify-between items-end mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">Learning Materials</h3>
                        <p className="text-sm text-muted-foreground">Curate links, documentation, and tutorials.</p>
                    </div>
                    <Button onClick={() => setIsAddResourceOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-2 size-4"/> Add Resource
                    </Button>
                 </div>

                 {resources.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/60 rounded-xl bg-secondary/5">
                          <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ring-secondary/20">
                             <LinkIcon className="size-8 text-muted-foreground" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">No resources added yet</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm text-center">
                            Keep track of documentation, video tutorials, and articles relevant to this topic.
                          </p>
                          <Button variant="outline" onClick={() => setIsAddResourceOpen(true)}>Add First Resource</Button>
                      </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {resources.map((res, index) => (
                                <motion.div 
                                    key={`${res.url}-${index}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ResourceCard 
                                        resource={res} 
                                        onDelete={() => handleDeleteResource(index)}
                                        onEdit={(name, url) => handleUpdateResource(index, name, url)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                     </div>
                  )}
             </div>
        </TabsContent>

        {/* TAB: HISTORY */}
        <TabsContent value="history" className="mt-6 overflow-y-auto animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
            <div className="max-w-3xl mx-auto">
                {topicSessions.length === 0 ? (
                     <div className="text-center py-20 text-muted-foreground">
                        <History className="size-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold text-foreground">No Sessions Recorded</h3>
                        <p className="max-w-sm mx-auto mt-2 text-sm">Start the timer in the "Study" tab to begin tracking your progress on this topic.</p>
                     </div>
                ) : (
                    <div className="relative border-l border-border/50 space-y-8 my-4 ml-4 pb-12">
                        {topicSessions.map((session) => (
                            <div key={session.id} className="ml-8 relative group">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[41px] top-3 flex size-5 items-center justify-center rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors z-10">
                                    <div className="size-1.5 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                                </div>
                                
                                <div className="flex flex-col bg-card border rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-primary"/> 
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatDate(new Date(session.start_time))}
                                            </span>
                                            <span className="text-xs text-muted-foreground mx-1">•</span>
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="font-mono text-xs border-primary/20 bg-primary/5 text-primary">
                                            {session.duration_minutes} min
                                        </Badge>
                                    </div>
                                    {session.journal_notes ? (
                                        <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md border-l-2 border-primary/30 italic">
                                            "{session.journal_notes}"
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground/50 italic pl-1">No session notes recorded.</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>

      {/* ADD RESOURCE DIALOG */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Add Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        placeholder="Documentation, Course, Video..." 
                        value={newResName} 
                        onChange={e => setNewResName(e.target.value)}
                        autoFocus
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>URL</Label>
                      <Input 
                        placeholder="https://..." 
                        value={newResUrl} 
                        onChange={e => setNewResUrl(e.target.value)} 
                      />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={handleAddResource} disabled={!newResName || !newResUrl}>Add Resource</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}