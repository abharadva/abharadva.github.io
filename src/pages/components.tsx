import Layout from "@/components/layout";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link"; // For Navigation Menu example
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// --- Icon Imports ---
import {
  Terminal,
  Settings,
  User as UserIcon,
  CreditCard,
  CalendarIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Palette,
  ChevronsUpDown,
  UploadCloud,
  Link2,
  Image as ImageIcon,
  AlignLeft,
} from "lucide-react";

// --- UI Component Imports (ensure all are correctly imported) ---
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
} from "recharts"; // Added more chart types
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Added more sidebar parts for demo
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { toast as sonnerToast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Data Structure for Sidebar and Sections ---
interface Variation {
  id: string; // e.g., "button-variants"
  name: string; // e.g., "Variants"
}

interface ComponentSectionItem {
  id: string; // e.g., "button" (for the main section)
  name: string;
  icon: JSX.Element;
  variations?: Variation[];
}

const componentSectionsList: ComponentSectionItem[] = [
  {
    id: "accordion",
    name: "Accordion",
    icon: <AlignLeft className="mr-2 size-4" />,
    variations: [
      { id: "accordion-basic", name: "Basic" },
      { id: "accordion-multiple", name: "Multiple Open" },
    ],
  },
  {
    id: "alertDialog",
    name: "Alert Dialog",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "alert",
    name: "Alert",
    icon: <Terminal className="mr-2 size-4" />,
    variations: [
      { id: "alert-default", name: "Default" },
      { id: "alert-destructive", name: "Destructive" },
    ],
  },
  {
    id: "aspectRatio",
    name: "Aspect Ratio",
    icon: <ImageIcon className="mr-2 size-4" />,
  },
  { id: "avatar", name: "Avatar", icon: <UserIcon className="mr-2 size-4" /> },
  {
    id: "badge",
    name: "Badge",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "badge-variants", name: "Variants" }],
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    icon: <HomeIcon className="mr-2 size-4" />,
  },
  {
    id: "button",
    name: "Button",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "button-variants", name: "Variants" },
      { id: "button-sizes", name: "Sizes" },
      { id: "button-icon", name: "With Icon" },
      { id: "button-disabled", name: "Disabled" },
      { id: "button-aschild", name: "As Child" },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: <CalendarIcon className="mr-2 size-4" />,
  },
  {
    id: "card",
    name: "Card",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "card-basic", name: "Basic Card" },
      { id: "card-form", name: "With Form" },
    ],
  },
  {
    id: "carousel",
    name: "Carousel",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "chart",
    name: "Chart",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "chart-bar", name: "Bar Chart" },
      { id: "chart-line", name: "Line Chart" },
    ],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "collapsible",
    name: "Collapsible",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "command",
    name: "Command",
    icon: <SearchIcon className="mr-2 size-4" />,
    variations: [
      { id: "command-inline", name: "Inline" },
      { id: "command-dialog", name: "Dialog" },
    ],
  },
  {
    id: "contextMenu",
    name: "Context Menu",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "dialog", name: "Dialog", icon: <Palette className="mr-2 size-4" /> },
  { id: "drawer", name: "Drawer", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "dropdownMenu",
    name: "Dropdown Menu",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "form", name: "Form", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "hoverCard",
    name: "Hover Card",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "input",
    name: "Input",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "input-basic", name: "Basic" },
      { id: "input-email", name: "Email" },
      { id: "input-disabled", name: "Disabled" },
    ],
  },
  {
    id: "inputOtp",
    name: "Input OTP",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "label", name: "Label", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "menubar",
    name: "Menubar",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "navigationMenu",
    name: "Navigation Menu",
    icon: <Link2 className="mr-2 size-4" />,
  },
  {
    id: "pagination",
    name: "Pagination",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "popover",
    name: "Popover",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "progress",
    name: "Progress",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "radioGroup",
    name: "Radio Group",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "resizable",
    name: "Resizable",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "scrollArea",
    name: "Scroll Area",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "select", name: "Select", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "separator",
    name: "Separator",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "sheet",
    name: "Sheet",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "sheet-sides", name: "Sides" }],
  },
  {
    id: "sidebar",
    name: "Sidebar",
    icon: <Palette className="mr-2 size-4" />,
    variations: [{ id: "sidebar-trigger", name: "Trigger Example" }],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "slider", name: "Slider", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "sonner",
    name: "Sonner Toasts",
    icon: <Palette className="mr-2 size-4" />,
  },
  { id: "switch", name: "Switch", icon: <Palette className="mr-2 size-4" /> },
  { id: "table", name: "Table", icon: <Palette className="mr-2 size-4" /> },
  { id: "tabs", name: "Tabs", icon: <Palette className="mr-2 size-4" /> },
  {
    id: "textarea",
    name: "Textarea",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "toastShadcn",
    name: "Toast (Shadcn)",
    icon: <Palette className="mr-2 size-4" />,
  },
  {
    id: "toggle",
    name: "Toggle",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "toggle-variants", name: "Variants" },
      { id: "toggle-pressed", name: "Pressed" },
    ],
  },
  {
    id: "toggleGroup",
    name: "Toggle Group",
    icon: <Palette className="mr-2 size-4" />,
    variations: [
      { id: "toggle-group-default", name: "Default" },
      { id: "toggle-group-outline", name: "Outline" },
    ],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    icon: <Palette className="mr-2 size-4" />,
  },
];

// --- Helper Components for Documentation Page ---
const CodeBlock: React.FC<{
  code: string;
  language?: string;
  title?: string;
}> = ({ code, language = "tsx", title }) => (
  <div className="my-6 rounded-none border-2 border-black bg-[#2d2d2d] shadow-[4px_4px_0_#000]">
    {title && (
      <div className="border-b-2 border-black bg-black px-3 py-1.5 font-mono text-sm font-bold text-yellow-300">
        {title}
      </div>
    )}
    <SyntaxHighlighter
      language={language}
      style={materialDark}
      customStyle={{
        margin: 0,
        borderRadius: 0,
        padding: "1rem",
        background: "transparent",
      }}
      showLineNumbers={code.trim().split("\n").length > 2}
      lineNumberStyle={{
        color: "#666",
        fontSize: "0.8em",
        marginRight: "1em",
        userSelect: "none",
      }}
      wrapLines={true}
      wrapLongLines={true}
    >
      {code.trim()}
    </SyntaxHighlighter>
  </div>
);

const ComponentDocSection: React.FC<{
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, description, children, className }) => (
  <section
    id={id}
    className={cn(
      "mb-16 py-8 px-6 border-2 border-black rounded-none shadow-[8px_8px_0px_#000] bg-white scroll-mt-24",
      className,
    )}
  >
    {" "}
    {/* scroll-mt-24 for fixed header offset */}
    <header className="mb-6 border-b-4 border-black pb-4">
      <h2 className="text-3xl font-black text-black sm:text-4xl">{title}</h2>
      <p className="text-md mt-1.5 font-semibold text-gray-700">
        {description}
      </p>
    </header>
    <div className="space-y-10">{children}</div>
  </section>
);

const VariationDisplay: React.FC<{
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, description, children, className }) => (
  <div
    id={id}
    className={cn(
      "mt-6 p-4 border-2 border-gray-400 rounded-none shadow-[3px_3px_0px_#aaa] bg-gray-50 scroll-mt-24",
      className,
    )}
  >
    {" "}
    {/* scroll-mt-24 for fixed header offset */}
    <h3 className="mb-1 border-b-2 border-gray-300 pb-1.5 text-xl font-black text-black">
      {title}
    </h3>
    {description && (
      <p className="my-2 text-sm font-medium text-gray-600">{description}</p>
    )}
    <div className="mt-4 flex flex-wrap items-center gap-4 space-y-4 md:items-start">
      {children}
    </div>
  </div>
);

const PropsTable: React.FC<{
  data: Array<{
    prop: string;
    type: string;
    default?: string;
    description: string;
  }>;
}> = ({ data }) => (
  <div className="mt-6 overflow-x-auto">
    <h4 className="mb-2 text-lg font-bold text-black">Key Props</h4>
    <Table className="border-2 border-black shadow-[2px_2px_0_#000]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Prop</TableHead>
          <TableHead className="w-[150px]">Type</TableHead>
          <TableHead className="w-[120px]">Default</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.prop}>
            <TableCell className="font-mono text-sm font-semibold">
              {row.prop}
            </TableCell>
            <TableCell className="font-mono text-xs text-indigo-700">
              {row.type}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {row.default || "–"}
            </TableCell>
            <TableCell className="text-sm">{row.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// --- Form schema & Chart data (moved from top level for clarity) ---
const uiFormSchemaInstance = z.object({
  username: z.string().min(2, "Min 2 chars").max(50),
  email: z.string().email(),
  framework: z.string().min(1, "Required"),
  notifications: z.boolean().default(false).optional(),
});
const uiChartConfigInstance = {
  views: { label: "Views", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;
const uiChartDataInstance = [
  { month: "Jan", views: 186 },
  { month: "Feb", views: 305 },
  { month: "Mar", views: 237 },
];

export default function UiDocumentationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(13);
  const [sliderVal, setSliderVal] = useState([50]);
  const [cmdDialog, setCmdDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const mainContentAreaRef = useRef<HTMLDivElement>(null);
  const [activeSidebarSection, setActiveSidebarSection] = useState<
    string | null
  >(componentSectionsList[0]?.id || null);

  const { toast: shadcnUIToastFn } = useShadcnToast();
  const formHook = useForm<z.infer<typeof uiFormSchemaInstance>>({
    resolver: zodResolver(uiFormSchemaInstance),
    defaultValues: { username: "", email: "", notifications: false },
  });
  function handleFormSubmit(values: z.infer<typeof uiFormSchemaInstance>) {
    sonnerToast.success("Form Data:", {
      description: (
        <CodeBlock code={JSON.stringify(values, null, 2)} language="json" />
      ),
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => setProgress(77), 500);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the main component ID for highlighting in sidebar
            const mainComponentId = componentSectionsList.find(
              (comp) =>
                comp.id === entry.target.id ||
                comp.variations?.some((v) => v.id === entry.target.id),
            )?.id;
            if (mainComponentId) setActiveSidebarSection(mainComponentId);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 }, // Adjust for better active state detection
    );

    componentSectionsList.forEach((section) => {
      const mainEl = document.getElementById(section.id);
      if (mainEl) observer.observe(mainEl);
      section.variations?.forEach((variation) => {
        const variationEl = document.getElementById(variation.id);
        if (variationEl) observer.observe(variationEl);
      });
    });

    return () => {
      clearTimeout(timer);
      componentSectionsList.forEach((section) => {
        const mainEl = document.getElementById(section.id);
        if (mainEl) observer.unobserve(mainEl);
        section.variations?.forEach((variation) => {
          const variationEl = document.getElementById(variation.id);
          if (variationEl) observer.unobserve(variationEl);
        });
      });
    };
  }, []);

  const scrollToSectionHandler = (id: string) => {
    const element = document.getElementById(id);
    if (element && mainContentAreaRef.current) {
      const headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        ) || "80",
      );
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerHeight - 16; // 16 for extra margin

      mainContentAreaRef.current.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      // Manually set active section for immediate feedback on click
      const mainComponentId = componentSectionsList.find(
        (comp) => comp.id === id || comp.variations?.some((v) => v.id === id),
      )?.id;
      if (mainComponentId) setActiveSidebarSection(mainComponentId);
    }
  };

  return (
    <Layout>
      {/* Define header height for sticky calculations, adjust if your header height changes */}
      <style jsx global>{`
        :root {
          --header-height: 80px;
        } /* Example, adjust to your actual fixed header height */
        @media (min-width: 768px) {
          :root {
            --header-height: 100px;
          }
        }
      `}</style>
      <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col bg-gray-100  md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full overflow-y-auto border-b-2 border-black bg-yellow-100 p-3 shadow-[3px_0px_0px_#000_inset] md:sticky md:top-[var(--header-height)] md:h-[calc(100vh-var(--header-height))] md:w-[30%] md:max-w-xs md:border-b-0 md:border-r-4">
          <h2 className="mb-2 border-b-2 border-black pb-1.5 text-lg font-black text-black">
            COMPONENTS
          </h2>
          <nav>
            <ul className="space-y-0">
              {componentSectionsList.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSectionHandler(section.id)}
                    className={cn(
                      "flex items-center w-full text-left px-2 py-1.5 rounded-none text-sm font-bold transition-all duration-100 border-2 border-transparent -ml-px -mt-px", // Negative margin for border overlap
                      activeSidebarSection === section.id
                        ? "bg-black text-white border-black shadow-[1.5px_1.5px_0px_#fff_inset]"
                        : "text-black hover:bg-yellow-300 hover:border-black hover:shadow-[1.5px_1.5px_0px_#000]",
                    )}
                  >
                    {section.icon} {section.name}
                  </button>
                  {section.variations &&
                    activeSidebarSection === section.id && (
                      <ul className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-400 pl-3">
                        {section.variations.map((variation) => (
                          <li key={variation.id}>
                            <button
                              onClick={() =>
                                scrollToSectionHandler(variation.id)
                              }
                              className="flex w-full items-center rounded-none px-2 py-1 text-left text-xs font-semibold text-gray-700 transition-colors duration-100 hover:bg-yellow-100 hover:text-black"
                            >
                              <span className="mr-2">-</span>
                              {variation.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main
          ref={mainContentAreaRef}
          className="w-full overflow-y-auto p-4 sm:p-6 md:w-[70%] md:p-8 lg:p-10"
        >
          <header className="mb-10 text-center md:text-left">
            <h1 className="border-b-4 border-black pb-3 text-4xl font-black text-black sm:text-5xl">
              UI Kit Docs
            </h1>
            <p className="mt-2 text-lg font-semibold text-gray-700">
              Neo-Brutalist Component Library
            </p>
          </header>

          {/* --- Accordion --- */}
          <ComponentDocSection
            id="accordion"
            title="Accordion"
            description="A vertically stacked set of interactive headings that each reveal a section of content."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import{" "}
                {
                  "{ Accordion, AccordionItem, AccordionTrigger, AccordionContent }"
                }{" "}
                from "@/components/ui/accordion";
              </code>
            </p>
            <VariationDisplay
              id="accordion-basic"
              title="Basic Usage (Single Item Collapsible)"
            >
              <Accordion type="single" collapsible className="w-full max-w-md">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Neo-Brutalism?</AccordionTrigger>
                  <AccordionContent>
                    Neo-Brutalism in UI design emphasizes raw, blocky elements,
                    strong typography, limited color palettes (often high
                    contrast), and an unrefined, functional aesthetic. It often
                    features hard shadows and visible borders.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </VariationDisplay>
            <CodeBlock
              code={`<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Section 1</AccordionTrigger>\n    <AccordionContent>Content for section 1.</AccordionContent>\n  </AccordionItem>\n</Accordion>`}
            />
            <VariationDisplay
              id="accordion-multiple"
              title="Multiple Items Openable"
            >
              <Accordion type="multiple" className="w-full max-w-md">
                <AccordionItem value="item-a">
                  <AccordionTrigger>Item One (Multiple)</AccordionTrigger>
                  <AccordionContent>Content one.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-b">
                  <AccordionTrigger>Item Two (Multiple)</AccordionTrigger>
                  <AccordionContent>Content two.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </VariationDisplay>
            <CodeBlock
              code={`<Accordion type="multiple">{/* ...items... */}</Accordion>`}
            />
            <PropsTable
              data={[
                {
                  prop: "type",
                  type: "'single' | 'multiple'",
                  default: "'single'",
                  description:
                    "Determines if multiple items can be open simultaneously.",
                },
                {
                  prop: "collapsible",
                  type: "boolean",
                  default: "false",
                  description:
                    "If type='single', allows the open item to be closed by clicking its trigger again.",
                },
                {
                  prop: "defaultValue",
                  type: "string | string[]",
                  description:
                    "The value(s) of the item(s) to be open initially.",
                },
                {
                  prop: "value",
                  type: "string | string[]",
                  description: "Controlled open item(s).",
                },
                {
                  prop: "onValueChange",
                  type: "(value: string | string[]) => void",
                  description: "Callback when open items change.",
                },
              ]}
            />
          </ComponentDocSection>

          {/* --- Button --- */}
          <ComponentDocSection
            id="button"
            title="Button"
            description="An interactive element to trigger actions, styled with Neo-Brutalist flair."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ Button }"} from "@/components/ui/button";
              </code>
            </p>
            <VariationDisplay
              id="button-variants"
              title="Variants"
              description="Different visual styles for various purposes."
            >
              <Button variant="default">Default Button</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Style</Button>
            </VariationDisplay>
            <CodeBlock
              code={`<Button variant="default">Default</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="outline">Outline</Button>\n{/* ...etc... */}`}
            />

            <VariationDisplay
              id="button-sizes"
              title="Sizes"
              description="Available button sizes."
            >
              <Button size="sm">Small</Button>
              <Button size="default">Default Size</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Settings">
                <Settings className="size-5" />
              </Button>
            </VariationDisplay>
            <CodeBlock
              code={`<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>\n<Button size="icon"><Icon /></Button>`}
            />

            <VariationDisplay
              id="button-icon"
              title="With Icon"
              description="Buttons can include icons for better context."
            >
              <Button>
                <UserIcon className="mr-2 size-4" /> Login with Email
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 size-4" /> Settings
              </Button>
            </VariationDisplay>
            <CodeBlock
              code={`<Button><UserIcon className="mr-2 h-4 w-4" /> Login</Button>`}
            />

            <VariationDisplay
              id="button-disabled"
              title="Disabled State"
              description="Visually indicates that the button is not interactive."
            >
              <Button disabled>Disabled Default</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
              <Button variant="destructive" disabled>
                Disabled Destructive
              </Button>
            </VariationDisplay>
            <CodeBlock code={`<Button disabled>Disabled Button</Button>`} />

            <VariationDisplay
              id="button-aschild"
              title="As Child (Polymorphic)"
              description="Render the button as a different HTML element, useful for links."
            >
              <Button asChild variant="link" className="text-lg">
                <a href="#button">Link Styled as Button</a>
              </Button>
            </VariationDisplay>
            <CodeBlock
              code={`<Button asChild variant="link">\n  <a href="/some-page">Navigation Link</a>\n</Button>`}
            />
            <PropsTable
              data={[
                {
                  prop: "variant",
                  type: "'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'",
                  default: "'default'",
                  description: "Button style variant.",
                },
                {
                  prop: "size",
                  type: "'default'|'sm'|'lg'|'icon'",
                  default: "'default'",
                  description: "Button size.",
                },
                {
                  prop: "asChild",
                  type: "boolean",
                  default: "false",
                  description: "Render as a child element, inheriting props.",
                },
                {
                  prop: "disabled",
                  type: "boolean",
                  default: "false",
                  description: "Disables button interaction.",
                },
              ]}
            />
          </ComponentDocSection>

          {/* --- Card --- */}
          <ComponentDocSection
            id="card"
            title="Card"
            description="A container for grouping related content, with a distinct Neo-Brutalist look."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import{" "}
                {
                  "{ Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }"
                }{" "}
                from "@/components/ui/card";
              </code>
            </p>
            <VariationDisplay id="card-basic" title="Basic Card Structure">
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Project Alpha</CardTitle>
                  <CardDescription>
                    A revolutionary new approach to web development.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    This card contains essential information about Project
                    Alpha, including its goals and expected outcomes. The
                    content area can hold various elements like text, lists, or
                    even images.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Learn More</Button>
                  <Button>Get Started</Button>
                </CardFooter>
              </Card>
            </VariationDisplay>
            <CodeBlock
              code={`
<Card>
  <CardHeader>
    <CardTitle>My Card Title</CardTitle>
    <CardDescription>A brief description for the card.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content of the card goes here.</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
            `}
            />
            <VariationDisplay id="card-form" title="Card with Form Elements">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>
                    Create an account to continue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="card-email">Email</Label>
                    <Input
                      id="card-email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-password">Password</Label>
                    <Input
                      id="card-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Create Account</Button>
                </CardFooter>
              </Card>
            </VariationDisplay>
            <CodeBlock
              code={`
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>
    {/* Form elements like Input, Label */}
  </CardContent>
  <CardFooter>...</CardFooter>
</Card>
            `}
            />
            <div className="mt-4 rounded-none border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-semibold text-yellow-800">
                <strong className="font-black">Anatomy:</strong>
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
                <li>`Card`: The main container.</li>
                <li>
                  `CardHeader`: Optional header section, often contains
                  `CardTitle` and `CardDescription`.
                </li>
                <li>`CardTitle`: The title of the card.</li>
                <li>`CardDescription`: Subtitle or brief description.</li>
                <li>`CardContent`: Main content area of the card.</li>
                <li>
                  `CardFooter`: Optional footer section, typically for actions.
                </li>
              </ul>
            </div>
          </ComponentDocSection>

          {/* --- Input --- */}
          <ComponentDocSection
            id="input"
            title="Input"
            description="A standard text input field for forms and data entry."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ Input }"} from "@/components/ui/input";
              </code>
            </p>
            <VariationDisplay id="input-basic" title="Basic Text Input">
              <Input
                type="text"
                placeholder="Enter your name"
                className="max-w-sm"
              />
            </VariationDisplay>
            <CodeBlock code={`<Input type="text" placeholder="Your Name" />`} />

            <VariationDisplay id="input-email" title="Email Input">
              <Input
                type="email"
                placeholder="you@example.com"
                className="max-w-sm"
              />
            </VariationDisplay>
            <CodeBlock
              code={`<Input type="email" placeholder="you@example.com" />`}
            />

            <VariationDisplay id="input-disabled" title="Disabled Input">
              <Input
                type="text"
                placeholder="Cannot edit"
                disabled
                className="max-w-sm"
              />
            </VariationDisplay>
            <CodeBlock
              code={`<Input type="text" placeholder="Disabled" disabled />`}
            />

            <PropsTable
              data={[
                {
                  prop: "type",
                  type: "string",
                  default: "'text'",
                  description:
                    "HTML input type (e.g., 'text', 'email', 'password', 'number').",
                },
                {
                  prop: "placeholder",
                  type: "string",
                  description: "Placeholder text for the input field.",
                },
                {
                  prop: "value",
                  type: "string | number",
                  description: "Controlled value of the input.",
                },
                {
                  prop: "onChange",
                  type: "(event: React.ChangeEvent<HTMLInputElement>) => void",
                  description: "Callback for value changes.",
                },
                {
                  prop: "disabled",
                  type: "boolean",
                  default: "false",
                  description: "If true, disables the input field.",
                },
                {
                  prop: "className",
                  type: "string",
                  description: "Additional CSS classes.",
                },
              ]}
            />
          </ComponentDocSection>

          {/* --- Input OTP --- */}
          <ComponentDocSection
            id="inputOtp"
            title="Input OTP"
            description="A specialized input field for one-time passcodes, typically used in multi-factor authentication."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import{" "}
                {"{ InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }"}{" "}
                from "@/components/ui/input-otp";
              </code>
            </p>
            <VariationDisplay
              id="inputOtp-basic"
              title="Basic 6-Digit OTP Input"
            >
              <div className="flex flex-col items-center space-y-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-sm font-semibold text-gray-600">
                  Current Value:{" "}
                  <span className="font-mono text-black">{otp || "----"}</span>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOtp("")}
                  disabled={!otp}
                >
                  Clear
                </Button>
              </div>
            </VariationDisplay>
            <CodeBlock
              code={`
const [otpValue, setOtpValue] = useState("");

<InputOTP maxLength={6} value={otpValue} onChange={(value) => setOtpValue(value)}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator /> {/* Optional separator */}
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
            `}
            />
            <VariationDisplay
              id="inputOtp-no-separator"
              title="OTP Input without Separator"
            >
              <InputOTP maxLength={4}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </VariationDisplay>
            <CodeBlock
              code={`
<InputOTP maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>
            `}
            />
            <PropsTable
              data={[
                {
                  prop: "maxLength",
                  type: "number",
                  default: "6 (usually)",
                  description: "Maximum number of characters for the OTP.",
                },
                {
                  prop: "value",
                  type: "string",
                  description: "Controlled value of the OTP input.",
                },
                {
                  prop: "onChange",
                  type: "(value: string) => void",
                  description: "Callback when the OTP value changes.",
                },
                {
                  prop: "pattern",
                  type: "string",
                  description:
                    "RegExp pattern for input validation (e.g., REGEXP_ONLY_DIGITS).",
                },
                {
                  prop: "containerClassName",
                  type: "string",
                  description: "Class name for the root OTPInput container.",
                },
                {
                  prop: "disabled",
                  type: "boolean",
                  default: "false",
                  description: "Disables the input field.",
                },
                {
                  prop: "children",
                  type: "ReactNode",
                  description: "Typically InputOTPGroup and InputOTPSeparator.",
                },
              ]}
            />
            <div className="mt-4 rounded-none border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-semibold text-yellow-800">
                <strong className="font-black">Child Components:</strong>
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
                <li>`InputOTPGroup`: Wraps a group of `InputOTPSlot`s.</li>
                <li>
                  `InputOTPSlot`: Represents an individual character slot.
                  Requires an `index` prop.
                </li>
                <li>
                  `InputOTPSeparator`: Optional visual separator between groups
                  of slots.
                </li>
              </ul>
            </div>
          </ComponentDocSection>

          {/* --- Label --- */}
          <ComponentDocSection
            id="label"
            title="Label"
            description="Renders an accessible label associated with a form control."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ Label }"} from "@/components/ui/label";
              </code>
            </p>
            <VariationDisplay id="label-basic" title="Basic Label with Input">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email-label">Email Address</Label>
                <Input
                  type="email"
                  id="email-label"
                  placeholder="you@example.com"
                />
              </div>
            </VariationDisplay>
            <CodeBlock
              code={`
<Label htmlFor="email">Email</Label>
<Input type="email" id="email" placeholder="Email" />
            `}
            />
            <VariationDisplay id="label-checkbox" title="Label with Checkbox">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms-label" />
                <Label htmlFor="terms-label" className="font-semibold">
                  Accept our awesome terms
                </Label>
              </div>
            </VariationDisplay>
            <CodeBlock
              code={`
<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms and conditions</Label>
            `}
            />
            <PropsTable
              data={[
                {
                  prop: "htmlFor",
                  type: "string",
                  description:
                    "The ID of the form control the label is associated with.",
                },
                {
                  prop: "className",
                  type: "string",
                  description: "Additional CSS classes for styling.",
                },
              ]}
            />
          </ComponentDocSection>

          {/* --- Menubar --- */}
          <ComponentDocSection
            id="menubar"
            title="Menubar"
            description="A horizontal menu bar, typically found at the top of an application, containing a list of commands."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ Menubar, MenubarMenu, MenubarTrigger, ... }"} from
                "@/components/ui/menubar";
              </code>
            </p>
            <VariationDisplay id="menubar-example" title="Example Menubar">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                      New Window <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>New Incognito Window</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                      <MenubarSubTrigger>Share</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>Email link</MenubarItem>
                        <MenubarItem>Messages</MenubarItem>
                        <MenubarItem>Notes</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>
                      Print... <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                      Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                      <MenubarSubTrigger>Find</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>Search the web...</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Find...</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                    <MenubarItem>Paste</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>View</MenubarTrigger>
                  <MenubarContent>
                    <MenubarCheckboxItem>
                      Show Bookmarks Bar
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem checked>
                      Show Full URLs
                    </MenubarCheckboxItem>
                    <MenubarSeparator />
                    <MenubarRadioGroup value="benoit">
                      <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                      <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                      <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </VariationDisplay>
            <CodeBlock
              code={`
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarSub>
        <MenubarSubTrigger>Share</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Email link</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      {/* ... more items ... */}
    </MenubarContent>
  </MenubarMenu>
  {/* ... more MenubarMenu ... */}
</Menubar>
            `}
            />
            <div className="mt-4 rounded-none border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-semibold text-yellow-800">
                <strong className="font-black">Key Parts:</strong>
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
                <li>`Menubar`: The root container for the menubar.</li>
                <li>
                  `MenubarMenu`: Container for a single top-level menu (e.g.,
                  "File", "Edit").
                </li>
                <li>
                  `MenubarTrigger`: The button that opens a `MenubarContent`.
                </li>
                <li>
                  `MenubarContent`: The dropdown panel containing menu items.
                </li>
                <li>
                  `MenubarItem`: A command item within the menu. Can include
                  `MenubarShortcut`.
                </li>
                <li>
                  `MenubarSeparator`: A visual divider between groups of items.
                </li>
                <li>
                  `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`: For
                  creating nested sub-menus.
                </li>
                <li>
                  `MenubarCheckboxItem`, `MenubarRadioGroup`,
                  `MenubarRadioItem`: Specialized menu items.
                </li>
              </ul>
            </div>
          </ComponentDocSection>

          {/* --- Navigation Menu --- */}
          <ComponentDocSection
            id="navigationMenu"
            title="Navigation Menu"
            description="A collection of links for navigating a website or application, often used as the primary navigation."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ NavigationMenu, NavigationMenuList, ... }"} from
                "@/components/ui/navigation-menu";
              </code>
            </p>
            <VariationDisplay
              id="navigationMenu-example"
              title="Example Navigation Menu"
            >
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 rounded-none border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex size-full select-none flex-col justify-end rounded-none border-2 border-black bg-gradient-to-b from-gray-100 to-gray-200 p-6 no-underline shadow-[2px_2px_0_#000] outline-none hover:bg-yellow-100 focus:shadow-md"
                              href="#navigationMenu"
                            >
                              <HomeIcon className="size-6 text-black" />
                              <div className="mb-2 mt-4 text-lg font-bold text-black">
                                UI Kit Home
                              </div>
                              <p className="text-sm leading-tight text-gray-700">
                                A beautiful set of components for your next
                                project.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItemUi href="#button" title="Buttons">
                          Robust and versatile button components.
                        </ListItemUi>
                        <ListItemUi href="#card" title="Cards">
                          Containers for content and actions.
                        </ListItemUi>
                        <ListItemUi href="#input" title="Inputs">
                          Standard form input fields.
                        </ListItemUi>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-3 rounded-none border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000] md:w-[400px] md:grid-cols-2">
                        <ListItemUi href="#alert" title="Alert">
                          Attention-grabbing messages.
                        </ListItemUi>
                        <ListItemUi href="#dialog" title="Dialog">
                          Modal confirmation windows.
                        </ListItemUi>
                        <ListItemUi href="#form" title="Forms">
                          Build accessible forms easily.
                        </ListItemUi>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a
                      href="#navigationMenu"
                      className={cn(navigationMenuTriggerStyle(), "font-bold")}
                    >
                      Documentation
                    </a>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </VariationDisplay>
            <CodeBlock
              code={`
// For NavigationMenuTrigger with dropdown:
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item With Dropdown</NavigationMenuTrigger>
      <NavigationMenuContent>
        {/* Use ListItemUi or your custom list items here */}
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
          <ListItemUi href="/docs/primitives/alert-dialog" title="Alert Dialog">
            A modal dialog that interrupts the user with important content...
          </ListItemUi>
          {/* More ListItemUi components */}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <Link href="/docs" legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          Simple Link
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>

// ListItemUi (helper, defined in ui.tsx for this demo):
const ListItemUi = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => { /* ...implementation... */ }
);
            `}
            />
            <div className="mt-4 rounded-none border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-semibold text-yellow-800">
                <strong className="font-black">Key Parts:</strong>
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
                <li>`NavigationMenu`: The root container.</li>
                <li>
                  `NavigationMenuList`: Contains the list of top-level menu
                  items.
                </li>
                <li>
                  `NavigationMenuItem`: Wraps each top-level item (trigger or
                  link).
                </li>
                <li>
                  `NavigationMenuTrigger`: A button that toggles a
                  `NavigationMenuContent` dropdown.
                </li>
                <li>
                  `NavigationMenuContent`: The dropdown panel. Often contains a
                  `ul` with `ListItemUi` (or similar custom components).
                </li>
                <li>
                  `NavigationMenuLink`: A styled link. Can be used directly or
                  with `navigationMenuTriggerStyle()`.
                </li>
              </ul>
            </div>
          </ComponentDocSection>

          {/* --- Pagination --- */}
          <ComponentDocSection
            id="pagination"
            title="Pagination"
            description="Controls for navigating numbered pages of content."
          >
            <p className="mb-4 text-sm">
              Import:{" "}
              <code className="rounded-none border border-black bg-gray-200 p-1 text-xs">
                import {"{ Pagination, PaginationContent, ... }"} from
                "@/components/ui/pagination";
              </code>
            </p>
            <VariationDisplay id="pagination-example" title="Basic Pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>10</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </VariationDisplay>
            <CodeBlock
              code={`
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href="#" /></PaginationItem>
  </PaginationContent>
</Pagination>
            `}
            />
            <div className="mt-4 rounded-none border-2 border-yellow-400 bg-yellow-100 p-3 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-semibold text-yellow-800">
                <strong className="font-black">Key Parts:</strong>
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
                <li>`Pagination`: The main container.</li>
                <li>`PaginationContent`: Wraps all pagination items.</li>
                <li>`PaginationItem`: List item wrapper for each element.</li>
                <li>
                  `PaginationPrevious`, `PaginationNext`: Buttons for
                  previous/next page.
                </li>
                <li>
                  `PaginationLink`: A page number link. Use `isActive` prop for
                  the current page.
                </li>
                <li>`PaginationEllipsis`: Represents omitted page numbers.</li>
              </ul>
            </div>
          </ComponentDocSection>

          {/* Placeholder for remaining components */}
          <section className="mt-16 rounded-none border-2 border-dashed border-gray-400 bg-gray-100 py-10 text-center">
            <h2 className="text-2xl font-bold text-gray-600">
              Further Component Documentation Pending...
            </h2>
            <p className="text-gray-500">
              This showcase is a work in progress. Follow the established
              pattern to document remaining components.
            </p>
          </section>
        </main>
      </div>
    </Layout>
  );
}

// Helper for NavigationMenu Content items
const ListItemUi = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-none border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:bg-yellow-100 hover:text-black hover:border-black focus:shadow-md focus:border-black shadow-[2px_2px_0px_transparent] hover:shadow-[2px_2px_0px_#000]",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none text-black">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItemUi.displayName = "ListItemUi";
