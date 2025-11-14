
import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { ArrowUpRight, Github, AlertTriangle, Loader2 } from "lucide-react";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

type ProjectsProps = PropsWithChildren;

const GITHUB_USERNAME = `akshay-bharadva`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9&type=owner`;

export default function Projects({ children }: ProjectsProps) {
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(GITHUB_REPOS_URL)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          throw new Error(
            `GitHub API Error: ${response.status} - ${errorData.message || "Unknown error"}`,
          );
        }
        return response.json();
      })
      .then((data: GitHubRepo[]) => {
        const filteredProjects = data
          .filter(p => !p.private && !p.fork && !p.archived && p.name !== GITHUB_USERNAME)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setProjects(filteredProjects.slice(0, 9));
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Could not load projects at this time.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <section className="my-8 py-16">
      <motion.h2 
        className="mb-12 border-b-2 border-foreground pb-4 text-3xl font-black uppercase text-foreground"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Projects
      </motion.h2>
      
      {loading && (
        <div className="py-10 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-bold text-muted-foreground">
            Loading Projects from GitHub...
          </p>
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Fetching Projects</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && projects.length === 0 && (
         <div className="rounded-none border-2 border-dashed border-foreground py-16 text-center">
          <Github className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-bold">No Public Projects Found</h3>
          <p className="text-muted-foreground">
            I might be working on something new, or they are private.
          </p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <motion.div 
            className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                 <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="text-md group">
              <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                More on GitHub 
                <ArrowUpRight className="ml-1.5 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </>
      )}
      
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}