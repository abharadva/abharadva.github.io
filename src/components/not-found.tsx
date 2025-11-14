import { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
return (
<section className="my-8 rounded-lg border bg-card p-8 py-12 text-center">
<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10 text-5xl font-black text-destructive">
!
</div>
<h1 className="mb-3 text-4xl font-black text-foreground">
<span className="text-destructive">404</span> | Page Not Found
</h1>
<p className="mb-4 text-lg leading-relaxed text-muted-foreground">
Whoops! Looks like this page took a wrong turn at Albuquerque.
</p>
<p className="mb-8 text-muted-foreground">Let's get you back on track.</p>

{children && <div className="mb-8">{children}</div>}
  
  <Button asChild size="lg">
    <Link href="/">Go Home <ArrowRight className="ml-1.5 size-4" /></Link>
  </Button>
</section>
);
}