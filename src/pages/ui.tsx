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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

const CodeBlock: React.FC<{ code: string; language?: string; title?: string; }> = ({ code, language = "tsx", title }) => (
  <div className="my-6 rounded-none border-2 border-black bg-[#2d2d2d] shadow-[4px_4px_0_#000]">
    {title && <div className="border-b-2 border-black bg-black px-3 py-1.5 font-mono text-sm font-bold text-yellow-300">{title}</div>}
    <SyntaxHighlighter language={language} style={materialDark} customStyle={{ margin: 0, borderRadius: 0, padding: "1rem", background: "transparent", fontSize: "0.8rem" }} showLineNumbers={code.trim().split("\n").length > 2} lineNumberStyle={{ color: "#666", fontSize: "0.75em", marginRight: "1em", userSelect: "none" }} wrapLines={true} wrapLongLines={true}>{code.trim()}</SyntaxHighlighter>
  </div>
);

const ComponentDocSection: React.FC<{ id: string; title: string; description: string; children: React.ReactNode; className?: string; }> = ({ id, title, description, children, className }) => (
  <section id={id} className={cn("mb-16 scroll-mt-24 rounded-none border-2 border-black bg-white px-6 py-8 shadow-[8px_8px_0px_#000]", className)}>
    <header className="mb-6 border-b-4 border-black pb-4"><h2 className="text-3xl font-black text-black sm:text-4xl">{title}</h2><p className="mt-1.5 text-md font-semibold text-gray-700">{description}</p></header>
    <div className="space-y-10">{children}</div>
  </section>
);

const VariationDisplay: React.FC<{ id?: string; title: string; description?: string; children: React.ReactNode; className?: string; }> = ({ id, title, description, children, className }) => (
  <div id={id} className={cn("mt-6 scroll-mt-24 rounded-none border-2 border-gray-400 bg-gray-50 p-4 shadow-[3px_3px_0px_#aaa]", className)}>
    <h3 className="mb-1 border-b-2 border-gray-300 pb-1.5 text-xl font-black text-black">{title}</h3>
    {description && <p className="my-2 text-sm font-medium text-gray-600">{description}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-4 space-y-4 md:items-start">{children}</div>
  </div>
);

const PropsTable: React.FC<{ data: Array<{ prop: string; type: string; default?: string; description: string; }>; }> = ({ data }) => (
  <div className="mt-6 overflow-x-auto"><h4 className="mb-2 text-lg font-bold text-black">Key Props</h4>
    <Table className="border-2 border-black shadow-[2px_2px_0_#000]">
      <TableHeader><TableRow><TableHead className="w-[150px]">Prop</TableHead><TableHead className="w-[150px]">Type</TableHead><TableHead className="w-[120px]">Default</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
      <TableBody>{data.map((row) => (<TableRow key={row.prop}><TableCell className="font-mono text-sm font-semibold">{row.prop}</TableCell><TableCell className="font-mono text-xs text-indigo-700">{row.type}</TableCell><TableCell className="font-mono text-xs">{row.default || "–"}</TableCell><TableCell className="text-sm">{row.description}</TableCell></TableRow>))}</TableBody>
    </Table>
  </div>
);

const uiFormSchemaInstance = z.object({ username: z.string().min(2, "Min 2 chars").max(50), email: z.string().email(), framework: z.string().min(1, "Required"), notifications: z.boolean().default(false).optional(), });
const uiChartConfigInstance = { views: { label: "Views", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;
const uiChartDataInstance = [{ month: "Jan", views: 186 }, { month: "Feb", views: 305 }, { month: "Mar", views: 237 },];

export default function UiDocumentationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progressValue, setProgressValue] = useState(13);
  const [sliderVal, setSliderVal] = useState([50]);
  const [cmdDialog, setCmdDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const mainContentAreaRef = useRef<HTMLDivElement>(null);
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(componentSectionsList[0]?.id || null);

  const { toast: shadcnUIToastFn } = useShadcnToast();
  const formHook = useForm<z.infer<typeof uiFormSchemaInstance>>({ resolver: zodResolver(uiFormSchemaInstance), defaultValues: { username: "", email: "", notifications: false }, });
  function handleFormSubmit(values: z.infer<typeof uiFormSchemaInstance>) { sonnerToast.success("Form Data:", { description: (<CodeBlock code={JSON.stringify(values, null, 2)} language="json" />), }); }

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(77), 500);
    const observer = new IntersectionObserver((entries) => { for (const entry of entries) { if (entry.isIntersecting) { const sectionId = entry.target.id; const mainComponent = componentSectionsList.find((comp) => comp.id === sectionId || comp.variations?.some((v) => v.id === sectionId)); if (mainComponent) { setActiveSidebarSection(mainComponent.id); } break; } } }, { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 });
    componentSectionsList.forEach((section) => { const mainEl = document.getElementById(section.id); if (mainEl) observer.observe(mainEl); section.variations?.forEach((variation) => { const variationEl = document.getElementById(variation.id); if (variationEl) observer.observe(variationEl); }); });
    return () => { clearTimeout(timer); componentSectionsList.forEach((section) => { const mainEl = document.getElementById(section.id); if (mainEl) observer.unobserve(mainEl); section.variations?.forEach((variation) => { const variationEl = document.getElementById(variation.id); if (variationEl) observer.unobserve(variationEl); }); }); };
  }, []);

  const scrollToSectionHandler = (id: string) => {
    const element = document.getElementById(id);
    if (element && mainContentAreaRef.current) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height") || "80");
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerHeight - 24;
      mainContentAreaRef.current.scrollTo({ top: offsetPosition, behavior: "smooth" });
      const mainComponentId = componentSectionsList.find((comp) => comp.id === id || comp.variations?.some((v) => v.id === id))?.id;
      if (mainComponentId) setActiveSidebarSection(mainComponentId);
    }
  };

  return (
    <Layout>
      <style jsx global>{`:root { --header-height: 80px; } @media (min-width: 768px) { :root { --header-height: 100px; } } html { scroll-behavior: smooth; }`}</style>
      <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col bg-gray-100  md:flex-row">
        <aside className="w-full overflow-y-auto border-b-2 border-black bg-yellow-100 p-3 shadow-[3px_0px_0px_#000_inset] md:sticky md:top-[var(--header-height)] md:h-[calc(100vh-var(--header-height))] md:w-[30%] md:max-w-xs md:border-b-0 md:border-r-4">
          <h2 className="mb-2 border-b-2 border-black pb-1.5 text-lg font-black text-black">COMPONENTS</h2>
          <nav><ul className="space-y-0">{componentSectionsList.map((section) => (<li key={section.id}><button onClick={() => scrollToSectionHandler(section.id)} className={cn("flex items-center w-full text-left px-2.5 py-1.5 rounded-none text-sm font-bold transition-all duration-100 border-2 border-transparent -ml-px -mt-px", activeSidebarSection === section.id ? "bg-black text-white border-black shadow-[1.5px_1.5px_0px_#fff_inset]" : "text-black hover:bg-yellow-300 hover:border-black hover:shadow-[1.5px_1.5px_0px_#000]")}>{section.icon} {section.name}</button>{section.variations && activeSidebarSection === section.id && (<ul className="mb-0.5 ml-3 mt-0 space-y-0 border-l-2 border-gray-500 bg-yellow-50 py-1 pl-4 shadow-[inset_2px_0px_0px_#eab308]">{section.variations.map((variation) => (<li key={variation.id}><button onClick={() => scrollToSectionHandler(variation.id)} className="flex w-full items-center rounded-none px-2 py-0.5 text-left text-xs font-semibold text-gray-700 transition-colors duration-100 hover:bg-yellow-200 hover:text-black"><span className="mr-2 text-gray-500">-</span>{variation.name}</button></li>))}</ul>)}</li>))}</ul></nav>
        </aside>

        <main ref={mainContentAreaRef} className="w-full overflow-y-auto p-4 sm:p-6 md:w-[70%] md:p-8 lg:p-10">
          <header className="mb-10 text-center md:text-left"><h1 className="border-b-4 border-black pb-3 text-4xl font-black text-black sm:text-5xl">UI Kit Docs</h1><p className="mt-2 text-lg font-semibold text-gray-700">Neo-Brutalist Component Library</p></header>
          {/* Component Sections Rendered Here */}
          <ComponentDocSection id="accordion" title="Accordion" description="A vertically stacked set of interactive headings that each reveal a section of content.">
             <VariationDisplay id="accordion-basic" title="Basic Usage">
                 <Accordion type="single" collapsible className="w-full max-w-md"><AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>Is it styled?</AccordionTrigger><AccordionContent>Yes. It comes with default styles that matches the other components' aesthetic.</AccordionContent></AccordionItem></Accordion>
             </VariationDisplay>
          </ComponentDocSection>
           <ComponentDocSection id="alertDialog" title="Alert Dialog" description="A modal dialog that interrupts the user with important content and expects a response.">
             <VariationDisplay id="alertDialog-confirm" title="Confirmation Dialog">
                <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your account.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => sonnerToast.error("Account Deletion Confirmed (Demo)")}>Yes, delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
             </VariationDisplay>
          </ComponentDocSection>
        </main>
      </div>
    </Layout>
  );
}

const ListItemUi = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(({ className, title, children, ...props }, ref) => {
  return (<li><NavigationMenuLink asChild><a ref={ref} className={cn("block select-none space-y-1 rounded-none border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:bg-yellow-100 hover:text-black hover:border-black focus:shadow-md focus:border-black shadow-[2px_2px_0px_transparent] hover:shadow-[2px_2px_0px_#000]", className)} {...props}><div className="text-sm font-bold leading-none text-black">{title}</div><p className="line-clamp-2 text-sm leading-snug text-gray-600">{children}</p></a></NavigationMenuLink></li>);
});
ListItemUi.displayName = "ListItemUi";