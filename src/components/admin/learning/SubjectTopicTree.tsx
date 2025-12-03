// src/components/admin/learning/SubjectTopicTree.tsx
"use client";

import { useState, useMemo } from "react";
import type { LearningSubject, LearningTopic, LearningSession } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Timer,
  Search,
  Hash,
  Folder,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubjectTopicTreeProps {
  subjects: LearningSubject[];
  topics: LearningTopic[];
  activeTopicId?: string | null;
  activeSession: LearningSession | null;
  onSelectTopic: (topic: LearningTopic) => void;
  onEditSubject: (subject: LearningSubject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditTopic: (topic: LearningTopic) => void;
  onDeleteTopic: (topicId: string) => void;
  onCreateSubject: () => void;
  onCreateTopic: (subjectId: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Mastered":
      return <Trophy className="size-3.5 text-yellow-500" />;
    case "Practicing":
      return <CheckCircle2 className="size-3.5 text-green-500" />;
    case "Learning":
      return <Timer className="size-3.5 text-blue-500" />;
    default:
      return <Circle className="size-3.5 text-muted-foreground/50" />;
  }
};

export default function SubjectTopicTree({
  subjects,
  topics,
  activeTopicId,
  activeSession,
  onSelectTopic,
  onEditSubject,
  onDeleteSubject,
  onEditTopic,
  onDeleteTopic,
  onCreateSubject,
  onCreateTopic,
}: SubjectTopicTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic
  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    return subjects.filter((subject) => {
      const subjectMatches = subject.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const hasMatchingTopics = topics.some(
        (t) =>
          t.subject_id === subject.id &&
          t.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return subjectMatches || hasMatchingTopics;
    });
  }, [subjects, topics, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-muted/10">
      {/* Header & Search */}
      <div className="p-3 space-y-3 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Hash className="size-4 text-primary" /> Curriculum
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
            onClick={onCreateSubject}
            title="Add Subject"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No subjects found.
          </div>
        )}

        <Accordion
          type="multiple"
          defaultValue={subjects.map((s) => s.id)}
          className="w-full space-y-3"
        >
          {filteredSubjects.map((subject) => {
            const subjectTopics = topics.filter(
              (t) => t.subject_id === subject.id,
            );

            // Filter topics if searching
            const visibleTopics = searchQuery
              ? subjectTopics.filter((t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                )
              : subjectTopics;

            const masteredCount = subjectTopics.filter(
              (t) => t.status === "Mastered",
            ).length;
            const progress =
              subjectTopics.length > 0
                ? Math.round((masteredCount / subjectTopics.length) * 100)
                : 0;

            return (
              <AccordionItem
                value={subject.id}
                key={subject.id}
                className="border-none"
              >
                <div className="group flex items-center justify-between py-1 pr-1 mb-1">
                  <AccordionTrigger className="flex-1 py-1 text-sm font-medium hover:no-underline data-[state=open]:text-foreground text-muted-foreground transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Folder className="size-3.5 shrink-0 fill-current opacity-70" />
                      <span className="truncate">{subject.name}</span>
                    </div>
                  </AccordionTrigger>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Only show progress if not searching to avoid clutter */}
                    {!searchQuery && subjectTopics.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono mr-1">
                        {progress}%
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onEditSubject(subject)}
                        >
                          <Edit2 className="mr-2 size-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCreateTopic(subject.id)}
                        >
                          <Plus className="mr-2 size-3.5" /> Add Topic
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteSubject(subject.id)}
                        >
                          <Trash2 className="mr-2 size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <AccordionContent className="pb-1 pt-0">
                  <div className="flex flex-col gap-0.5 ml-2 border-l border-border pl-2">
                    {visibleTopics.map((topic) => {
                      const isCurrentlyLearning =
                        activeSession?.topic_id === topic.id;
                      const isActive = activeTopicId === topic.id;

                      return (
                        <div
                          key={topic.id}
                          className="group relative flex items-center"
                        >
                          <button
                            className={cn(
                              "flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 h-full w-full text-left",
                              isActive
                                ? "bg-background shadow-sm border border-border/50 text-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                            )}
                            onClick={() => onSelectTopic(topic)}
                          >
                            <div className="relative shrink-0 flex items-center justify-center">
                              {getStatusIcon(topic.status)}
                              {isCurrentlyLearning && (
                                <span className="absolute inset-0 flex h-full w-full rounded-full bg-blue-500/20 animate-ping" />
                              )}
                            </div>
                            <span className="truncate">{topic.title}</span>
                          </button>

                          {/* Quick Edit Action */}
                          <div
                            className={cn(
                              "absolute right-1 flex items-center",
                              isActive
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100 transition-opacity",
                            )}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <MoreHorizontal className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                  onClick={() => onEditTopic(topic)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => onDeleteTopic(topic.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                    {!searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-start px-2 text-xs text-muted-foreground/70 hover:text-foreground mt-1"
                        onClick={() => onCreateTopic(subject.id)}
                      >
                        <Plus className="mr-2 size-3" />
                        New Topic
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
