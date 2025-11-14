
import { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotFoundProps = PropsWithChildren;

export default function NotFound({ children }: NotFoundProps) {
return (
<section className="my-8 rounded-none border-2 border-foreground bg-card p-8 py-12 text-center shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#FFF]">
<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-none border-2 border-destructive bg-destructive/10 text-5xl font-black text-destructive">
!
</div>
<h1 className="mb-3 text-4xl font-black uppercase text-foreground">
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