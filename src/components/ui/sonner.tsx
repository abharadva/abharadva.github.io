/*
This file is updated to style the `sonner` toast component according to the new design system.
- The `toast` class is updated to use `rounded-lg`, a subtle `border`, and standard theme colors for `background` and `foreground`. The neo-brutalist `shadow` is removed.
- `title` and `description` classes are updated to use the theme's font styles.
- `actionButton` and `cancelButton` are restyled to match the new `Button` component variants.
- `closeButton` is restyled to be a minimal icon button, consistent with other components like `Dialog` and `Sheet`.
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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          title: "group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-muted-foreground group-[.toast]:border-0 hover:group-[.toast]:bg-secondary group-[.toast]:p-1 group-[.toast]:rounded-md group-[.toast]:right-2 group-[.toast]:top-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };