// src/components/SectionRenderer.tsx
import React from 'react';
import { PortfolioSection } from '@/types';
import Experience from '@/components/experience';
import Projects from '@/components/projects';
import Technology from '@/components/technology';
import Tools from '@/components/tools';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SectionRendererProps {
  section: PortfolioSection;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  // Use a unique title to map to a specific component
  // This gives you fine-grained control
  switch (section.title) {
    case 'Experience':
      return <Experience showTitle={false} />;
    case 'Tech Stack':
      return <Technology />;
    case 'Tools':
      return <Tools />;
    // You could add a case for your new 'Featured Projects' here too if desired
    default:
      // Fallback for generic markdown sections
      if (section.type === 'markdown' && section.content) {
        return (
          <section className="my-16 py-16">
            <h2 className="text-4xl font-black text-center mb-12">{section.title}</h2>
            <div className="prose dark:prose-invert max-w-3xl mx-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
            </div>
          </section>
        );
      }
      return null; // Or a placeholder for other types
  }
}