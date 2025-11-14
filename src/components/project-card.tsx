
import Link from "next/link";
import { PropsWithChildren } from "react";
import { ArrowUpRight } from "lucide-react";
import type { GitHubRepo } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProjectCardProps = PropsWithChildren & {
  project: GitHubRepo;
};

export default function ProjectCard({ children, project }: ProjectCardProps) {
  return (
    <Card
      className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-none active:translate-x-1 active:translate-y-1 hover:border-accent"
      key={project.id}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="transition-colors group-hover:text-accent uppercase">
            {project.name.replaceAll("-", " ")}
          </CardTitle>
          {project.html_url && (
            <a
              href={project.html_url}
              rel="noopener noreferrer nofollow"
              target="_blank"
              title="View on GitHub"
              aria-label={`View ${project.name} on GitHub`}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()} // Prevents link wrapper from firing if it exists
            >
              <ArrowUpRight className="size-5" />
            </a>
          )}
        </div>
        <CardDescription className="line-clamp-3 pt-1">
          {project.description || (
            <span className="italic">No description provided.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         {children}
      </CardContent>
      {(project.language || (project.topics && project.topics.length > 0)) && (
        <CardFooter>
          <div className="flex shrink flex-wrap gap-1.5">
            {project.language && (
              <Badge variant="secondary">{project.language}</Badge>
            )}
            {project.topics &&
              project.topics.slice(0, 3).map((topic: string) => (
                <Badge key={topic} variant="outline">{topic}</Badge>
              ))}
          </div>
        </CardFooter>
      )}
      {project.html_url && (
         <Link href={project.html_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0">
            <span className="sr-only">View project: {project.name}</span>
         </Link>
      )}
    </Card>
  );
}