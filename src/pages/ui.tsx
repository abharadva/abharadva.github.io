
import Layout from "@/components/layout";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// --- Icon Imports ---
import { Terminal, Settings, User as UserIcon, CreditCard, CalendarIcon, Home as HomeIcon, Search as SearchIcon, Palette, ChevronsUpDown, Link2, ImageIcon, AlignLeft, Bold, Italic, Underline, CheckCircle, XCircle, Info, MessageSquare, Code, List, ListOrdered } from "lucide-react";

// --- UI Component Imports ---
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Data Structure for Sidebar and Sections
interface Variation { id: string; name: string; }
interface ComponentSectionItem { id: string; name: string; icon: JSX.Element; variations?: Variation[]; }

const componentSectionsList: ComponentSectionItem[] = [
  { id: "accordion", name: "Accordion", icon: <AlignLeft className="mr-2 size-4" />, variations: [{ id: "accordion-basic", name: "Basic" }, { id: "accordion-multiple", name: "Multiple Open" }] },
  { id: "alertDialog", name: "Alert Dialog", icon: <MessageSquare className="mr-2 size-4" />, variations: [{ id: "alertDialog-confirm", name: "Confirmation" }] },
  { id: "alert", name: "Alert", icon: <Info className="mr-2 size-4" />, variations: [{ id: "alert-default", name: "Default" }, { id: "alert-destructive", name: "Destructive" }] },
  { id: "aspectRatio", name: "Aspect Ratio", icon: <ImageIcon className="mr-2 size-4" /> },
  { id: "avatar", name: "Avatar", icon: <UserIcon className="mr-2 size-4" /> },
  { id: "badge", name: "Badge", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "badge-variants", name: "Variants" }] },
  { id: "breadcrumb", name: "Breadcrumb", icon: <HomeIcon className="mr-2 size-4" /> },
  { id: "button", name: "Button", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "button-variants", name: "Variants" }, { id: "button-sizes", name: "Sizes" }, { id: "button-icon", name: "With Icon" }, { id: "button-disabled", name: "Disabled" }, { id: "button-aschild", name: "As Child" }] },
  { id: "calendar", name: "Calendar", icon: <CalendarIcon className="mr-2 size-4" /> },
  { id: "card", name: "Card", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "card-basic", name: "Basic Card" }, { id: "card-form", name: "With Form" }] },
  { id: "carousel", name: "Carousel", icon: <Palette className="mr-2 size-4" /> },
  { id: "chart", name: "Chart", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "chart-bar", name: "Bar Chart" }, { id: "chart-line", name: "Line Chart" }] },
  { id: "checkbox", name: "Checkbox", icon: <CheckCircle className="mr-2 size-4" />, variations: [{ id: "checkbox-basic", name: "Basic" }, { id: "checkbox-disabled", name: "Disabled" }] },
  { id: "collapsible", name: "Collapsible", icon: <ChevronsUpDown className="mr-2 size-4" /> },
  { id: "command", name: "Command", icon: <SearchIcon className="mr-2 size-4" />, variations: [{ id: "command-inline", name: "Inline" }, { id: "command-dialog", name: "Dialog" }] },
  { id: "contextMenu", name: "Context Menu", icon: <Palette className="mr-2 size-4" /> },
  { id: "dialog", name: "Dialog", icon: <MessageSquare className="mr-2 size-4" /> },
  { id: "drawer", name: "Drawer", icon: <Palette className="mr-2 size-4" /> },
  { id: "dropdownMenu", name: "Dropdown Menu", icon: <ChevronsUpDown className="mr-2 size-4" /> },
  { id: "form", name: "Form", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "form-example", name: "Example Usage" }] },
  { id: "hoverCard", name: "Hover Card", icon: <Palette className="mr-2 size-4" /> },
  { id: "input", name: "Input", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "input-basic", name: "Text" }, { id: "input-email", name: "Email" }, { id: "input-password", name: "Password" }, { id: "input-disabled", name: "Disabled" }] },
  { id: "inputOtp", name: "Input OTP", icon: <Code className="mr-2 size-4" />, variations: [{ id: "inputOtp-6digit", name: "6-Digit" }, { id: "inputOtp-4digit", name: "4-Digit" }] },
  { id: "label", name: "Label", icon: <Palette className="mr-2 size-4" /> },
  { id: "menubar", name: "Menubar", icon: <Palette className="mr-2 size-4" /> },
  { id: "navigationMenu", name: "Navigation Menu", icon: <Link2 className="mr-2 size-4" /> },
  { id: "pagination", name: "Pagination", icon: <Palette className="mr-2 size-4" /> },
  { id: "popover", name: "Popover", icon: <MessageSquare className="mr-2 size-4" /> },
  { id: "progress", name: "Progress", icon: <Palette className="mr-2 size-4" /> },
  { id: "radioGroup", name: "Radio Group", icon: <ListOrdered className="mr-2 size-4" /> },
  { id: "resizable", name: "Resizable", icon: <Palette className="mr-2 size-4" /> },
  { id: "scrollArea", name: "Scroll Area", icon: <Palette className="mr-2 size-4" /> },
  { id: "select", name: "Select", icon: <ChevronsUpDown className="mr-2 size-4" />, variations: [{ id: "select-basic", name: "Basic" }, { id: "select-groups", name: "With Groups" }] },
  { id: "separator", name: "Separator", icon: <Palette className="mr-2 size-4" /> },
  { id: "sheet", name: "Sheet", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "sheet-sides", name: "All Sides" }] },
  { id: "skeleton", name: "Skeleton", icon: <Palette className="mr-2 size-4" /> },
  { id: "slider", name: "Slider", icon: <Palette className="mr-2 size-4" /> },
  { id: "sonner", name: "Sonner Toasts", icon: <MessageSquare className="mr-2 size-4" />, variations: [{ id: "sonner-default", name: "Default" }, { id: "sonner-destructive", name: "Destructive" }] },
  { id: "switch", name: "Switch", icon: <Palette className="mr-2 size-4" /> },
  { id: "table", name: "Table", icon: <List className="mr-2 size-4" /> },
  { id: "tabs", name: "Tabs", icon: <Palette className="mr-2 size-4" /> },
  { id: "textarea", name: "Textarea", icon: <Palette className="mr-2 size-4" /> },
  { id: "toastShadcn", name: "Toast (Shadcn)", icon: <MessageSquare className="mr-2 size-4" />, variations: [{ id: "toastShadcn-default", name: "Default" }, { id: "toastShadcn-destructive", name: "Destructive" }] },
  { id: "toggle", name: "Toggle", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "toggle-variants", name: "Variants" }, { id: "toggle-pressed", name: "Pressed" }, { id: "toggle-texticon", name: "With Text/Icon" }] },
  { id: "toggleGroup", name: "Toggle Group", icon: <Palette className="mr-2 size-4" />, variations: [{ id: "toggle-group-multiple", name: "Multiple" }, { id: "toggle-group-single", name: "Single (Outline)" }] },
  { id: "tooltip", name: "Tooltip", icon: <MessageSquare className="mr-2 size-4" /> },
];

const ComponentDisplay: React.FC<{
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ id, title, description, children }) => (
  <Card id={id} className="scroll-mt-24">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </CardContent>
  </Card>
);

export default function UiPage() {
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(componentSectionsList[0]?.id || null);
  
  const scrollToSectionHandler = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSidebarSection(id);
    }
  };

  useEffect(() => {
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
      componentSectionsList.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <Layout>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b-2 bg-card p-3 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:w-64 md:border-b-0 md:border-r-2 md:border-foreground">
          <ScrollArea className="h-full pr-4">
            <h2 className="mb-2 px-2 text-lg font-bold tracking-tight uppercase">Components</h2>
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

        <main className="w-full overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <header className="mb-10 text-center md:text-left">
            <h1 className="border-b-2 border-foreground pb-3 text-4xl font-black uppercase tracking-tighter sm:text-5xl">UI Kit</h1>
            <p className="mt-2 text-lg text-muted-foreground">A showcase of the redesigned component library.</p>
          </header>
          <div className="space-y-16">
            <ComponentDisplay id="button" title="Button" description="Various styles and sizes for buttons.">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </ComponentDisplay>
            <ComponentDisplay id="card" title="Card" description="A container for grouping content.">
              <Card className="w-[350px]">
                <CardHeader><CardTitle>Card Title</CardTitle><CardDescription>Card Description</CardDescription></CardHeader>
                <CardContent><p>This is the main content area of the card.</p></CardContent>
                <CardFooter><Button>Deploy</Button></CardFooter>
              </Card>
            </ComponentDisplay>
            <ComponentDisplay id="alert" title="Alert" description="Displays a prominent message.">
                <Alert><Terminal className="h-4 w-4" /><AlertTitle>Heads up!</AlertTitle><AlertDescription>This is a default alert.</AlertDescription></Alert>
                <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error!</AlertTitle><AlertDescription>This is a destructive alert.</AlertDescription></Alert>
            </ComponentDisplay>
          </div>
        </main>
      </div>
    </Layout>
  );
}