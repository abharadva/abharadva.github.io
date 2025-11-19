
import Link from "next/link";
import { useRouter } from "next/router";
import {
    Banknote,
    BookText,
    LayoutTemplate,
    ListTodo,
    Lock,
    StickyNote,
    Calendar as CalendarIcon,
    BrainCircuit,
    Home,
    Navigation,
    ImageIcon,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Blog", href: "/admin/blog", icon: BookText },
    { name: "Calendar", href: "/admin/calendar", icon: CalendarIcon },
    { name: "Content", href: "/admin/content", icon: LayoutTemplate },
    { name: "Tasks", href: "/admin/tasks", icon: ListTodo },
    { name: "Notes", href: "/admin/notes", icon: StickyNote },
    { name: "Finance", href: "/admin/finance", icon: Banknote },
    { name: "Learning", href: "/admin/learning", icon: BrainCircuit },
    { name: "Assets", href: "/admin/assets", icon: ImageIcon },
    { name: "Navigation", href: "/admin/navigation", icon: Navigation },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Security", href: "/admin/security", icon: Lock },
];

interface SidebarProps {
    onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
    const router = useRouter();

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
                <Link href="/admin" className="font-mono text-lg font-semibold tracking-tighter">
                    ADMIN<span className="text-primary">.</span>PANEL
                </Link>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = router.pathname === item.href || (item.href !== '/admin' && router.pathname.startsWith(item.href));
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={onLinkClick}
                                            className={cn(
                                                isActive
                                                    ? "bg-secondary text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive
                                                        ? "text-primary"
                                                        : "text-muted-foreground group-hover:text-foreground",
                                                    "h-6 w-6 shrink-0"
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
}