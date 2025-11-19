import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/supabase/client';

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

interface SiteContentContextType {
  content: SiteContent | null;
  isLoading: boolean;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_identity')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching site identity:', error);
      } else {
        setContent(data as unknown as SiteContent);
      }
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, isLoading }}>
      {children}
    </SiteContentContext.Provider>
  );
};