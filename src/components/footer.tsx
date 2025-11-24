// src/components/footer.tsx
import Link from "next/link";
import Container from "./container";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "./ui/skeleton";
import { Github, Linkedin, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";

const socialIcons: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const FooterSkeleton = () => (
  <footer className="w-full border-t border-border/50 py-16 text-sm text-muted-foreground">
    <Container>
      <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
        </div>
      </div>
    </Container>
  </footer>
);

export default function Footer() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();
  const currentYear = new Date().getFullYear();

  if (isLoading || !content) {
    return <FooterSkeleton />;
  }

  const { footer_data, social_links, profile_data } = content;

  return (
    <footer className="w-full border-t border-border/50 py-16 text-sm text-muted-foreground">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center text-muted-foreground md:text-left [&_p]:m-0 prose prose-sm 
            prose-p:text-muted-foreground 
            prose-a:text-primary hover:prose-a:underline"
          >
            <p>
              &copy; {currentYear} {profile_data.name}.
            </p>
            <ReactMarkdown>{footer_data.copyright_text}</ReactMarkdown>
          </div>

          <div className="flex items-center gap-6">
            {social_links
              .filter((s) => s.is_visible)
              .map((social) => {
                const Icon = socialIcons[social.id.toLowerCase()];
                return Icon ? (
                  <a
                    key={social.url}
                    href={social.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={social.label}
                    className="text-2xl transition-colors hover:text-primary"
                  >
                    <Icon className="size-5" />
                  </a>
                ) : null;
              })}
          </div>
        </div>
      </Container>
    </footer>
  );
}
