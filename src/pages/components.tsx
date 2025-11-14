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
} from "recharts";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface ComponentSectionItem {
  id: string;
  name: string;
  icon: JSX.Element;
}

const componentSectionsList: ComponentSectionItem[] = [
  { id: "accordion", name: "Accordion", icon: <AlignLeft className="mr-2 size-4" /> },
  { id: "alertDialog", name: "Alert Dialog", icon: <Palette className="mr-2 size-4" /> },
  { id: "alert", name: "Alert", icon: <Terminal className="mr-2 size-4" /> },
  { id: "aspectRatio", name: "Aspect Ratio", icon: <ImageIcon className="mr-2 size-4" /> },
  { id: "avatar", name: "Avatar", icon: <UserIcon className="mr-2 size-4" /> },
  { id: "badge", name: "Badge", icon: <Palette className="mr-2 size-4" /> },
  { id: "breadcrumb", name: "Breadcrumb", icon: <HomeIcon className="mr-2 size-4" /> },
  { id: "button", name: "Button", icon: <Palette className="mr-2 size-4" /> },
  { id: "calendar", name: "Calendar", icon: <CalendarIcon className="mr-2 size-4" /> },
  { id: "card", name: "Card", icon: <Palette className="mr-2 size-4" /> },
  { id: "carousel", name: "Carousel", icon: <Palette className="mr-2 size-4" /> },
  { id: "chart", name: "Chart", icon: <Palette className="mr-2 size-4" /> },
  { id: "checkbox", name: "Checkbox", icon: <Palette className="mr-2 size-4" /> },
  { id: "collapsible", name: "Collapsible", icon: <Palette className="mr-2 size-4" /> },
  { id: "command", name: "Command", icon: <SearchIcon className="mr-2 size-4" /> },
  { id: "contextMenu", name: "Context Menu", icon: <Palette className="mr-2 size-4" /> },
  { id: "dialog", name: "Dialog", icon: <Palette className="mr-2 size-4" /> },
  { id: "drawer", name: "Drawer", icon: <Palette className="mr-2 size-4" /> },
  { id: "dropdownMenu", name: "Dropdown Menu", icon: <Palette className="mr-2 size-4" /> },
  { id: "form", name: "Form", icon: <Palette className="mr-2 size-4" /> },
  { id: "hoverCard", name: "Hover Card", icon: <Palette className="mr-2 size-4" /> },
  { id: "input", name: "Input", icon: <Palette className="mr-2 size-4" /> },
  { id: "inputOtp", name: "Input OTP", icon: <Palette className="mr-2 size-4" /> },
  { id: "label", name: "Label", icon: <Palette className="mr-2 size-4" /> },
  { id: "menubar", name: "Menubar", icon: <Palette className="mr-2 size-4" /> },
  { id: "navigationMenu", name: "Navigation Menu", icon: <Link2 className="mr-2 size-4" /> },
  { id: "pagination", name: "Pagination", icon: <Palette className="mr-2 size-4" /> },
  { id: "popover", name: "Popover", icon: <Palette className="mr-2 size-4" /> },
  { id: "progress", name: "Progress", icon: <Palette className="mr-2 size-4" /> },
  { id: "radioGroup", name: "Radio Group", icon: <Palette className="mr-2 size-4" /> },
  { id: "resizable", name: "Resizable", icon: <Palette className="mr-2 size-4" /> },
  { id: "scrollArea", name: "Scroll Area", icon: <Palette className="mr-2 size-4" /> },
  { id: "select", name: "Select", icon: <Palette className="mr-2 size-4" /> },
  { id: "separator", name: "Separator", icon: <Palette className="mr-2 size-4" /> },
  { id: "sheet", name: "Sheet", icon: <Palette className="mr-2 size-4" /> },
  { id: "skeleton", name: "Skeleton", icon: <Palette className="mr-2 size-4" /> },
  { id: "slider", name: "Slider", icon: <Palette className="mr-2 size-4" /> },
  { id: "sonner", name: "Sonner Toasts", icon: <Palette className="mr-2 size-4" /> },
  { id: "switch", name: "Switch", icon: <Palette className="mr-2 size-4" /> },
  { id: "table", name: "Table", icon: <Palette className="mr-2 size-4" /> },
  { id: "tabs", name: "Tabs", icon: <Palette className="mr-2 size-4" /> },
  { id: "textarea", name: "Textarea", icon: <Palette className="mr-2 size-4" /> },
  { id: "toastShadcn", name: "Toast (Shadcn)", icon: <Palette className="mr-2 size-4" /> },
  { id: "toggle", name: "Toggle", icon: <Palette className="mr-2 size-4" /> },
  { id: "toggleGroup", name: "Toggle Group", icon: <Palette className="mr-2 size-4" /> },
  { id: "tooltip", name: "Tooltip", icon: <Palette className="mr-2 size-4" /> },
];

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
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(componentSectionsList[0]?.id || null);

  const { toast: shadcnUIToastFn } = useShadcnToast();
  const formHook = useForm<z.infer<typeof uiFormSchemaInstance>>({
    resolver: zodResolver(uiFormSchemaInstance),
    defaultValues: { username: "", email: "", notifications: false },
  });
  function handleFormSubmit(values: z.infer<typeof uiFormSchemaInstance>) {
    sonnerToast.success("Form Data:", {
      description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white">{JSON.stringify(values, null, 2)}</code></pre>
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => setProgress(77), 500);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSidebarSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.1 },
    );

    componentSectionsList.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      clearTimeout(timer);
      componentSectionsList.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);
  
  const scrollToSectionHandler = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSidebarSection(id);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b bg-card p-3 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:w-64 md:border-b-0 md:border-r">
          <ScrollArea className="h-full pr-4">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Components</h2>
            <nav>
              <ul className="space-y-1">
                {componentSectionsList.map((section) => (
                  <li key={section.id}>
                    <Button
                      variant={activeSidebarSection === section.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => scrollToSectionHandler(section.id)}
                      className="w-full justify-start"
                    >
                      {section.icon} {section.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
        </aside>

        <main ref={mainContentAreaRef} className="w-full overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <header className="mb-10 text-center md:text-left">
            <h1 className="border-b pb-3 text-4xl font-black tracking-tighter sm:text-5xl">UI Kit</h1>
            <p className="mt-2 text-lg text-muted-foreground">A showcase of the redesigned component library.</p>
          </header>
          
          <div className="space-y-16">
            <Card id="button"><CardHeader><CardTitle>Button</CardTitle><CardDescription>Displays a button or a link.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-4"><Button>Default</Button><Button variant="destructive">Destructive</Button><Button variant="outline">Outline</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button></CardContent></Card>
            <Card id="card"><CardHeader><CardTitle>Card</CardTitle><CardDescription>A container for content.</CardDescription></CardHeader><CardContent><Card className="w-[350px]"><CardHeader><CardTitle>Project</CardTitle><CardDescription>Deploy your project.</CardDescription></CardHeader><CardContent><p>Card content goes here.</p></CardContent><CardFooter><Button>Deploy</Button></CardFooter></Card></CardContent></Card>
            <Card id="input"><CardHeader><CardTitle>Input</CardTitle><CardDescription>A text input field.</CardDescription></CardHeader><CardContent><Input type="email" placeholder="Email" className="max-w-sm"/></CardContent></Card>
            <Card id="accordion"><CardHeader><CardTitle>Accordion</CardTitle><CardDescription>A vertically stacked set of interactive headings.</CardDescription></CardHeader><CardContent><Accordion type="single" collapsible className="w-full max-w-md"><AccordionItem value="item-1"><AccordionTrigger>Section 1</AccordionTrigger><AccordionContent>Content for section 1.</AccordionContent></AccordionItem></Accordion></CardContent></Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}