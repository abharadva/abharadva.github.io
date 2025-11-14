import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types";

type ProjectsProps = PropsWithChildren;

const GITHUB_USERNAME = `akshay-bharadva`; // Use a constant for username
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9&type=owner`; // Fetch only owner repos

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
            `GitHub API request failed: ${response.status} - ${errorData.message || "Unknown error"}`,
          );
        }
        return response.json();
      })
      .then((data: GitHubRepo[]) => {
        const filteredProjects = data
          .filter(
            (p) =>
              !p.private &&
              p.language &&
              !p.fork &&
              !p.archived &&
              p.name !== GITHUB_USERNAME,
          )
          .sort(
            (a, b) =>
              (b.stargazers_count || 0) - (a.stargazers_count || 0) ||
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
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

  return (
    <section className="my-8 ">
      <h2 className="mb-8 border-b-4 border-black pb-3 text-3xl font-black text-black">
        Projects
      </h2>
      {loading && (
        <div className="py-10 text-center">
          <div className="mx-auto inline-block size-12 animate-spin rounded-none border-y-4 border-black"></div>
          <p className="mt-4 text-lg font-bold text-black">
            Loading Projects from GitHub...
          </p>
        </div>
      )}
      {error && !loading && (
        <div className="rounded-none border-2 border-red-500 bg-red-100 p-4 font-semibold text-red-700 shadow-[3px_3px_0_#B91C1C]">
          Error: {error}
        </div>
      )}
      {!loading && !error && projects.length === 0 && (
        <div className="rounded-none border-2 border-black bg-yellow-100 p-8 py-16 text-center shadow-[6px_6px_0_#000]">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-none border-2 border-black bg-black text-5xl font-black text-yellow-300">
              ?
            </div>
            <h3 className="mb-2 text-2xl font-bold text-black">
              NO PUBLIC PROJECTS FOUND.
            </h3>
            <p className="font-medium text-gray-700">
              I might be working on something new, or they are private. Check
              GitHub for more!
            </p>
          </div>
        </div>
      )}
      {!loading && !error && projects.length > 0 && (
        <>
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="text-center">
            <Link href={
              `https://github.com/${GITHUB_USERNAME}?tab=repositories`

            } passHref legacyBehavior>
              <Button asChild variant="outline" size="lg" className="text-md group">
                <a>More on GitHub <BsArrowUpRight className="ml-1.5 inline transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Button>
            </Link>
          </div>
        </>
      )
      }
      {children && <div className="mt-8">{children}</div>}
    </section >
  );
}