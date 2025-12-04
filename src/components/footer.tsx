import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Container from "./container";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "./ui/skeleton";
import { Github, Linkedin, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
  const router = useRouter();

  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    setClickCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1000);

      if (clickCount === 5) {
        toast.success("Initializing Admin Sequence...");
        router.push("/admin");
        setClickCount(0);
      }

      return () => clearTimeout(timer);
    }
  }, [clickCount, router]);

  if (isLoading || !content) {
    return <FooterSkeleton />;
  }

  const { footer_data, social_links, profile_data } = content;

  return (
    <footer className="w-full border-t border-border/50 py-16 text-sm text-muted-foreground">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div
            className="text-center text-muted-foreground md:text-left [&_p]:m-0 prose prose-sm 
            prose-p:text-muted-foreground 
            prose-a:text-primary hover:prose-a:underline"
          >
            <p>
              {/* Wrap the copyright symbol/year in a span with the click handler */}
              <span
                onClick={handleSecretClick}
                className="cursor-default select-none active:scale-95 inline-block transition-transform"
              >
                &copy; {currentYear}
              </span>{" "}
              {profile_data.name}.
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