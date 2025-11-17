
import { useState, useEffect } from "react";
import { ArrowUpRight, Github, AlertTriangle, Loader2 } from "lucide-react";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

type ProjectsProps = {
  showTitle?: boolean;
};

const GITHUB_USERNAME = "akshay-bharadva";
const REPO_COUNT = 9; // Fetch more to have enough to filter from
const GITHUB_REPOS_URL = "https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=${REPO_COUNT}&type=owner"

export default function Projects({ showTitle = true }: ProjectsProps) {
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
          throw new Error(`GitHub API request failed: ${response.status} - ${errorData.message || "Unknown error"}`);
        }
        return response.json();
      })
      .then((data: GitHubRepo[]) => {
        const filteredProjects = data
          .filter(
            (p) =>
              !p.private &&
              !p.fork &&
              !p.archived &&
              p.name !== GITHUB_USERNAME &&
              p.stargazers_count > 0, // Only show projects with at least one star
          )
          .sort(
            (a, b) =>
              (b.stargazers_count || 0) - (a.stargazers_count || 0) ||
              new Date(b.pushed_at).getTime() -
              new Date(a.pushed_at).getTime(),
          );
        setProjects(filteredProjects.slice(0, 6)); // Display up to 6 projects
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
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

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

      {loading && (
        <div className="py-10 text-center flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-lg">Loading Projects from GitHub...</p>
        </div>
      )}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && projects.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <h3 className="text-lg font-bold">No public projects found.</h3>
          <p>I might be working on something new, or they are private. Check GitHub for more!</p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <motion.div
            className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button asChild size="lg" className="text-md group">
              <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                More on GitHub
                <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
          </motion.div>
        </>
      )}
    </section>
  );
}