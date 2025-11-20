// src/types/index.ts

export interface PortfolioSection {
  id: string;
  user_id?: string;
  title: string;
  type: "markdown" | "list_items" | "gallery";
  content?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  is_visible: boolean;
  page_path: string;
  layout_style: string;
  portfolio_items?: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  section_id: string;
  user_id?: string;
  title: string;
  subtitle?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  tags?: string[] | null;
  internal_notes?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  user_id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  published?: boolean;
  published_at?: string | null;
  tags?: string[] | null;
  views?: number;
  internal_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GitHubRepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  private: boolean;
  archived: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  languages_url?: string;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage?: string | null;
  owner: GitHubRepoOwner;
}

export interface Event {
  id: string;
  user_id?: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  is_all_day?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id?: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubTask {
  id: string;
  task_id: string;
  user_id?: string;
  title: string;
  is_completed: boolean;
  created_at?: string;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  status?: 'todo' | 'inprogress' | 'done';
  due_date?: string | null;
  priority?: "low" | "medium" | "high";
  created_at?: string;
  updated_at?: string;
  sub_tasks?: SubTask[];
}

export interface Transaction {
  id: string;
  user_id?: string;
  date: string;
  description: string;
  amount: number;
  type: "earning" | "expense";
  category?: string | null;
  created_at?: string;
  updated_at?: string;
  recurring_transaction_id?: string | null;
}

export interface RecurringTransaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: "earning" | "expense";
  category?: string | null;
  frequency: "daily" | "weekly" | "bi-weekly" | "monthly" | "yearly";
  start_date: string;
  end_date?: string | null;
  occurrence_day?: number | null;
  last_processed_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LearningSubject {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type LearningStatus = 'To Learn' | 'Learning' | 'Practicing' | 'Mastered';

export interface LearningTopic {
  id: string;
  user_id?: string;
  subject_id: string;
  title: string;
  status: LearningStatus;
  core_notes?: string | null;
  resources?: { name: string; url: string }[] | null;
  confidence_score?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LearningSession {
  id: string;
  user_id?: string;
  topic_id: string;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number | null;
  journal_notes?: string | null;
  created_at?: string;
}

// Added from old SiteContentContext
export interface SiteContent {
    profile_data: {
      name: string;
      title: string;
      description: string;
      profile_picture_url: string;
      show_profile_picture: boolean;
      logo: {
        main: string;
        highlight: string;
      };
      status_panel: {
        title: string;
        availability: string;
        currently_exploring: {
          title: string;
          items: string[];
        };
        latestProject: {
          name: string;
          linkText: string;
          href: string;
        };
      };
      bio: string[];
      github_projects_config: {
        username: string;
        show: boolean;
        sort_by: 'created' | 'updated' | 'pushed';
        exclude_forks: boolean;
        exclude_archived: boolean;
        exclude_profile_repo: boolean;
        min_stars: number;
        projects_per_page: number;
      };
    };
    social_links: {
      id: string;
      label: string;
      url: string;
      is_visible: boolean;
    }[];
    footer_data: {
      copyright_text: string;
    };
}