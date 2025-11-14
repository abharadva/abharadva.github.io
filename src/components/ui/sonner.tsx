
/*
This file has been updated to style the `sonner` toast component for the neo-brutalist theme.
- The `toast` class now applies `rounded-none`, `border-2 border-black`, and a hard `shadow-[...]`.
- `title` and `description` classes are updated with bolder font weights.
- `actionButton` and `cancelButton` are restyled to look like the new neo-brutalist `Button` component, inheriting its blocky, bordered appearance.
- `closeButton` is styled as a simple, bordered icon button.
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
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-2 group-[.toaster]:border-black group-[.toaster]:shadow-[6px_6px_0_#000] group-[.toaster]:rounded-none",
          title: "group-[.toast]:font-bold",
          description: "group-[.toast]:text-neutral-600",
          actionButton:
            "group-[.toast]:bg-black group-[.toast]:text-white group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          cancelButton:
            "group-[.toast]:bg-neutral-200 group-[.toast]:text-black group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-neutral-500 group-[.toast]:border-2 group-[.toast]:border-transparent hover:group-[.toast]:border-black group-[.toast]:p-1 group-[.toast]:rounded-none group-[.toast]:right-2 group-[.toast]:top-2",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };