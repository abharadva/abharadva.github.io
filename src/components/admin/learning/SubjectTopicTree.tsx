// src/components/admin/learning/SubjectTopicTree.tsx
"use client";

import type { LearningSubject, LearningTopic, LearningSession } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, BrainCircuit, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SubjectTopicTree({ subjects, topics, activeTopicId, activeSession, onSelectTopic, onEditSubject, onDeleteSubject, onEditTopic, onDeleteTopic, onCreateSubject, onCreateTopic }: SubjectTopicTreeProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold uppercase text-muted-foreground">Knowledge Base</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreateSubject}>
          <PlusCircle className="size-4" /> <span className="sr-only">New Subject</span>
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={subjects.map(s => s.id)} className="w-full">
        {subjects.map((subject) => (
          <AccordionItem value={subject.id} key={subject.id}>
            <div className="group flex items-center justify-between pr-1">
              <AccordionTrigger className="flex-1 py-2 text-sm font-semibold hover:no-underline">{subject.name}</AccordionTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEditSubject(subject)}><Edit className="mr-2 size-4" />Edit Subject</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDeleteSubject(subject.id)}><Trash2 className="mr-2 size-4" />Delete Subject</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AccordionContent className="pb-2 pl-4">
              <div className="space-y-1">
                {topics.filter((t) => t.subject_id === subject.id).map((topic) => {
                  const isCurrentlyLearning = activeSession?.topic_id === topic.id;
                  return (
                    <div key={topic.id} className="group flex items-center">
                      <Button variant={activeTopicId === topic.id ? "secondary" : "ghost"} className="h-8 flex-1 justify-start px-2 text-left" onClick={() => onSelectTopic(topic)}>
                        <div className="relative mr-2">
                           <BrainCircuit className="size-3.5 shrink-0" />
                           {isCurrentlyLearning && <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary animate-ping" />}
                        </div>
                        <span className="truncate">{topic.title}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEditTopic(topic)}><Edit className="mr-2 size-4" />Edit Topic</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => onDeleteTopic(topic.id)}><Trash2 className="mr-2 size-4" />Delete Topic</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
                <Button variant="ghost" size="sm" className="h-8 w-full justify-start px-2 text-muted-foreground" onClick={() => onCreateTopic(subject.id)}>
                  <PlusCircle className="mr-2 size-3.5" />New Topic
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}