import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, Github, AlertTriangle, Loader2 } from "lucide-react";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useSiteContent } from "@/context/SiteContentContext";

type ProjectsProps = {
  showTitle?: boolean;
};

export default function Projects({ showTitle = true }: ProjectsProps) {
  const { content, isLoading: isContentLoading } = useSiteContent();
  const [projects, setProjects] = useState<GitHubRepo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const config = content?.profile_data.github_projects_config;

  const fetchProjects = useCallback(async (pageNum: number) => {
    if (!config || !config.username) {
      setError("GitHub username is not configured in the admin panel.");
      setInitialLoading(false);
      return;
    }

    if (pageNum === 1) setInitialLoading(true);
    else setLoadingMore(true);
    
    setError(null);

    const GITHUB_REPOS_URL = `https://api.github.com/users/${config.username}/repos?sort=${config.sort_by}&per_page=${config.projects_per_page}&type=owner&page=${pageNum}`;

    try {
      const response = await fetch(GITHUB_REPOS_URL);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`GitHub API request failed: ${response.status} - ${errorData.message || "Unknown error"}`);
      }
      const data: GitHubRepo[] = await response.json();
      
      const filteredProjects = data.filter((p) => {
        if (config.exclude_forks && p.fork) return false;
        if (config.exclude_archived && p.archived) return false;
        if (config.exclude_profile_repo && p.name === config.username) return false;
        if (p.stargazers_count < config.min_stars) return false;
        return !p.private;
      });
      
      setProjects(prev => pageNum === 1 ? filteredProjects : [...prev, ...filteredProjects]);
      
      if (data.length < config.projects_per_page) {
        setHasMore(false);
      }
      
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setError(err.message || "Could not load projects at this time.");
    } finally {
      if (pageNum === 1) setInitialLoading(false);
      else setLoadingMore(false);
    }
  }, [config]);

  useEffect(() => {
    if (isContentLoading) return;
    if (config?.show) {
      fetchProjects(1);
    } else {
      setInitialLoading(false);
    }
  }, [isContentLoading, config, fetchProjects]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (!isContentLoading && !config?.show) {
    return null;
  }
  
  return (
    <section className="my-24 py-16">
      {showTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative mb-16 text-center"
        >
          <h1 className="text-5xl font-black text-foreground md:text-6xl">My Projects</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A selection of my open-source work from GitHub.
          </p>
        </motion.div>
      )}

      {(initialLoading || isContentLoading) && (
        <div className="py-10 text-center flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-lg">Loading Projects from GitHub...</p>
        </div>
      )}
      {error && !initialLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!initialLoading && !error && projects.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <h3 className="text-lg font-bold">No public projects found matching the criteria.</h3>
          <p>I might be working on something new, or they are filtered out. Check GitHub for more!</p>
        </div>
      )}

      {!initialLoading && !error && projects.length > 0 && (
        <>
          <motion.div
            className="columns-1 gap-4 sm:columns-2 lg:columns-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants} className="break-inside-avoid mb-4">
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            {hasMore ? (
              <Button onClick={handleLoadMore} size="lg" className="text-md" disabled={loadingMore}>
                {loadingMore ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading...
                    </>
                ) : "Load More Projects"}
              </Button>
            ) : (
                <Button asChild size="lg" className="text-md group">
                    <a href={`https://github.com/${config?.username}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                        View All on GitHub
                        <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                </Button>
            )}
          </motion.div>
        </>
      )}
    </section>
  );
}