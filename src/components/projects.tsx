// src/components/projects.tsx
import { useState, useEffect } from "react";
import { ArrowUpRight, AlertTriangle, Loader2 } from "lucide-react";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetGitHubReposQuery } from "@/store/api/publicApi";


type ProjectsProps = {
  showTitle?: boolean;
};

export default function Projects({ showTitle = true }: ProjectsProps) {
  const { data: content, isLoading: isContentLoading } = useGetSiteIdentityQuery();
  const [page, setPage] = useState(1);
  const [allProjects, setAllProjects] = useState<GitHubRepo[]>([]);
  const config = content?.profile_data.github_projects_config;

  const {
    data: projects,
    error,
    isLoading: isFetchingProjects,
    isFetching: isFetchingMore,
  } = useGetGitHubReposQuery(
    config?.show && config.username
      ? {
        username: config.username,
        sort_by: config.sort_by,
        projects_per_page: config.projects_per_page,
        page,
        exclude_forks: config.exclude_forks,
        exclude_archived: config.exclude_archived,
        exclude_profile_repo: config.exclude_profile_repo,
        min_stars: config.min_stars,
      }
      : skipToken
  );

  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (projects) {
      if (page === 1) {
        setAllProjects(projects);
      } else {
        setAllProjects((prev) => [...prev, ...projects]);
      }
      setHasMore(projects.length === (config?.projects_per_page || 9));
    }
  }, [projects, page, config?.projects_per_page]);


  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const initialLoading = isContentLoading || (isFetchingProjects && page === 1);

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

      {initialLoading && (
        <div className="py-10 text-center flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-lg">Loading Projects from GitHub...</p>
        </div>
      )}
      {!!error && !initialLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Could not load projects at this time.'}
          </AlertDescription>
        </Alert>
      )}
      {!initialLoading && !error && allProjects.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <h3 className="text-lg font-bold">No public projects found matching the criteria.</h3>
          <p>I might be working on something new, or they are filtered out. Check GitHub for more!</p>
        </div>
      )}

      {!initialLoading && !error && allProjects.length > 0 && (
        <>
          <motion.div
            className="columns-1 gap-4 sm:columns-2 lg:columns-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {allProjects.map((project) => (
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
              <Button onClick={handleLoadMore} size="lg" className="text-md" disabled={isFetchingMore}>
                {isFetchingMore ? (
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