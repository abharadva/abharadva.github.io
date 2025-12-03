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
import { Github, Star, GitFork, ExternalLink } from "lucide-react";

type ProjectCardProps = { project: GitHubRepo };

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden bg-blueprint-bg border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold font-mono tracking-tight text-foreground group-hover:text-primary transition-colors">
              {project.name.replaceAll("-", " ")}
            </CardTitle>
            {project.html_url && (
              <Link
                href={project.html_url}
                target="_blank"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="size-3" /> view repository
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs font-mono">
              <Star className="size-3.5" />
              <span>{project.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono">
              <GitFork className="size-3.5" />
              <span>{project.forks_count}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <CardDescription className="text-sm leading-relaxed line-clamp-3">
          {project.description || "No description provided."}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <div className="flex flex-wrap gap-2 w-full">
          {project.language && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-transparent font-mono text-[10px]"
            >
              {project.language}
            </Badge>
          )}
          {project.topics &&
            project.topics.slice(0, 2).map((topic: string) => (
              <Badge
                key={topic}
                variant="outline"
                className="border-border/50 text-[10px] text-muted-foreground"
              >
                {topic}
              </Badge>
            ))}
        </div>
      </CardFooter>

      {/* Full card click overlay for better UX */}
      {project.html_url && (
        <Link
          href={project.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-lg"
        >
          <span className="sr-only">View project: {project.name}</span>
        </Link>
      )}
    </Card>
  );
}
