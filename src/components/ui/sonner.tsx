
/*
This file is updated to style the `sonner` toast component according to the new neo-brutalist design system.
- The `toast` class is updated to use `rounded-none`, a `border-2`, and a hard `shadow-[...]`.
- `title` and `description` classes are updated to use the theme's bold font styles.
- `actionButton` and `cancelButton` are restyled to match the new `Button` component, including its neo-brutalist features.
- `closeButton` is restyled to be a functional icon button with a visible border on hover.
*/
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-foreground group-[.toaster]:shadow-[4px_4px_0px_#000] dark:group-[.toaster]:shadow-[4px_4px_0px_#FFF] group-[.toaster]:rounded-none",
          title: "group-[.toast]:font-bold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-transparent hover:group-[.toast]:border-foreground group-[.toast]:p-1 group-[.toast]:rounded-none group-[.toast]:right-2 group-[.toast]:top-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };