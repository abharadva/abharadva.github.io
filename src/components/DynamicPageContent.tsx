import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { PortfolioSection } from '@/types';
import SectionRenderer from './SectionRenderer';
import { Loader2 } from 'lucide-react';

interface DynamicPageContentProps {
  pagePath: string;
}

export default function DynamicPageContent({ pagePath }: DynamicPageContentProps) {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pagePath) return;

    const fetchSections = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*, portfolio_items(*)')
        .eq('page_path', pagePath)
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('display_order', { foreignTable: 'portfolio_items', ascending: true });

      if (error) {
        console.error(`Error fetching content for ${pagePath}:`, error);
      } else {
        setSections(data || []);
      }
      setIsLoading(false);
    };

    fetchSections();
  }, [pagePath]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {sections.map(section => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}