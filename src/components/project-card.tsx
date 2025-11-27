import Link from "next/link";
import type { GitHubRepo } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Star } from "lucide-react";

type ProjectCardProps = { project: GitHubRepo };

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card
      className="group relative flex h-full flex-col overflow-hidden bg-blueprint-bg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
      key={project.id}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="pr-8 text-base transition-colors group-hover:text-primary">
            {project.name.replaceAll("-", " ")}
          </CardTitle>
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Star className="size-3" />
            <span>{project.stargazers_count}</span>
          </div>
        </div>
        {project.description ? (
          <CardDescription className="line-clamp-3 pt-1 text-sm">
            {project.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex-grow" />
      {(project.language || (project.topics && project.topics.length > 0)) && (
        <CardFooter>
          <div className="flex shrink flex-wrap gap-1.5">
            {project.language && (
              <Badge variant="secondary" className="font-mono">
                {project.language}
              </Badge>
            )}
            {project.topics &&
              project.topics.slice(0, 3).map((topic: string) => (
                <Badge key={topic} variant="outline" className="font-mono">
                  {topic}
                </Badge>
              ))}
          </div>
        </CardFooter>
      )}
      {project.html_url && (
        <Link
          href={project.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">View project: {project.name}</span>
        </Link>
      )}
    </Card>
  );
}
