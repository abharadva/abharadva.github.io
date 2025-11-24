// src/store/api/publicApi.ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/supabase/client";
import type {
  BlogPost,
  GitHubRepo,
  PortfolioSection,
  SiteContent,
} from "@/types";

type NavLink = { label: string; href: string };

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "SiteContent",
    "Posts",
    "Post",
    "Portfolio",
    "Navigation",
    "SiteSettings",
  ],
  endpoints: (builder) => ({
    getSiteIdentity: builder.query<SiteContent, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("site_identity")
          .select("*")
          .single();
        if (error) return { error };
        return { data: data as SiteContent };
      },
      providesTags: ["SiteContent"],
    }),
    getNavLinks: builder.query<NavLink[], void>({
      queryFn: async () => {
        const [identityRes, linksRes] = await Promise.all([
          supabase.from("site_identity").select("portfolio_mode").single(),
          supabase
            .from("navigation_links")
            .select("label, href")
            .eq("is_visible", true)
            .order("display_order"),
        ]);

        if (linksRes.error) return { error: linksRes.error };

        const portfolioMode = identityRes.data?.portfolio_mode || "multi-page";
        let finalLinks = linksRes.data || [];

        if (portfolioMode === "single-page") {
          finalLinks = finalLinks.filter(
            (link) =>
              link.href === "/" ||
              link.href === "/contact" ||
              link.href === "/blog",
          );
        }
        return { data: finalLinks };
      },
      providesTags: ["Navigation", "SiteContent"],
    }),
    getPublishedBlogPosts: builder.query<BlogPost[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Posts" as const, id })),
            { type: "Posts", id: "LIST" },
          ]
          : [{ type: "Posts", id: "LIST" }],
    }),
    getBlogPostBySlug: builder.query<BlogPost, string>({
      queryFn: async (slug) => {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();
        if (error && error.code !== "PGRST116") return { error };
        if (!data)
          return {
            error: { message: "Not Found", details: "", hint: "", code: "404" },
          };
        return { data };
      },
      providesTags: (result) =>
        result ? [{ type: "Post", id: result.id }] : [],
    }),
    incrementPostView: builder.mutation<void, string>({
      queryFn: async (postId) => {
        const { error } = await supabase.rpc("increment_blog_post_view", {
          post_id_to_increment: postId,
        });
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "Posts", id: "LIST" },
      ],
    }),
    getSectionsByPath: builder.query<PortfolioSection[], string>({
      queryFn: async (pagePath) => {
        const { data, error } = await supabase
          .from("portfolio_sections")
          .select("*, portfolio_items(*)")
          .eq("page_path", pagePath)
          .eq("is_visible", true)
          .order("display_order")
          .order("display_order", { foreignTable: "portfolio_items" });
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, path) => [{ type: "Portfolio", id: path }],
    }),
    getGitHubRepos: builder.query<
      GitHubRepo[],
      {
        username: string;
        sort_by: string;
        projects_per_page: number;
        page: number;
        exclude_forks: boolean;
        exclude_archived: boolean;
        exclude_profile_repo: boolean;
        min_stars: number;
      }
    >({
      queryFn: async (args) => {
        const {
          username,
          sort_by,
          projects_per_page,
          page,
          exclude_forks,
          exclude_archived,
          exclude_profile_repo,
          min_stars,
        } = args;
        const url = `https://api.github.com/users/${username}/repos?sort=${sort_by}&per_page=${projects_per_page}&type=owner&page=${page}`;
        try {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(
              `GitHub API request failed: ${response.statusText}`,
            );
          const data: GitHubRepo[] = await response.json();
          const filtered = data.filter((p) => {
            if (exclude_forks && p.fork) return false;
            if (exclude_archived && p.archived) return false;
            if (exclude_profile_repo && p.name === username) return false;
            if (p.stargazers_count < min_stars) return false;
            return !p.private;
          });
          return { data: filtered };
        } catch (error: any) {
          return {
            error: {
              message: error.message,
              details: "",
              hint: "",
              code: "FETCH_ERROR",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetSiteIdentityQuery,
  useGetNavLinksQuery,
  useGetPublishedBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useIncrementPostViewMutation,
  useGetSectionsByPathQuery,
  useGetGitHubReposQuery,
} = publicApi;
