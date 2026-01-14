import { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
  return (
    <section className="my-8 rounded-lg bg-blueprint-bg p-8 py-16 text-center">
      <h1 className="mb-3 font-mono text-6xl font-black text-primary md:text-8xl">
        404
      </h1>
      <h2 className="mb-4 text-3xl font-bold text-foreground">
        PAGE NOT FOUND
      </h2>
      <p className="mb-8 max-w-md mx-auto text-muted-foreground">
        Looks like you've ventured into uncharted territory. The page you're
        looking for doesn't exist or has been moved.
      </p>

      {children && <div className="mb-8">{children}</div>}

      <Button asChild size="lg">
        <Link href="/">
          Return to Homebase <ArrowRight className="ml-1.5 size-4" />
        </Link>
      </Button>
    </section>
  );
}
