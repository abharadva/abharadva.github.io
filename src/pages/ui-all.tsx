
import Layout from "@/components/layout";
import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  Link2,
  ImageIcon,
  AlignLeft,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

// --- UI Component Imports ---
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ContextMenuContent,
  ContextMenuItem,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
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
  SelectItem,
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

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
});

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
];

const ComponentDisplay: React.FC<{
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ id, title, description, children }) => (
  <Card id={id} className="scroll-mt-24">
    <CardHeader>
      <CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
    <CardContent className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </CardContent>
  </Card>
);

export default function UiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(13);
  const { toast: shadcnToast } = useShadcnToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    sonnerToast.success(`Form Submitted: ${JSON.stringify(values, null, 2)}`);
  }
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter">UI Component Library</h1>
          <p className="mt-2 text-lg text-muted-foreground">A showcase of all available components.</p>
        </header>
        <div className="space-y-16">
          <ComponentDisplay id="button" title="Button" description="Various styles and sizes for buttons.">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="lg">Large</Button>
            <Button size="sm">Small</Button>
            <Button size="icon"><Settings className="size-4" /></Button>
            <Button><UserIcon className="mr-2 size-4" /> With Icon</Button>
          </ComponentDisplay>
          
          <ComponentDisplay id="card" title="Card" description="A container for grouping related content.">
             <Card className="w-[350px]">
              <CardHeader><CardTitle>Card Title</CardTitle><CardDescription>Card Description</CardDescription></CardHeader>
              <CardContent><p>This is the main content area of the card.</p></CardContent>
              <CardFooter className="flex justify-between"><Button variant="outline">Cancel</Button><Button>Deploy</Button></CardFooter>
            </Card>
          </ComponentDisplay>

          <ComponentDisplay id="input-elements" title="Input Elements" description="Components for data entry.">
             <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="email-input">Email</Label>
                <Input type="email" id="email-input" placeholder="Email" />
             </div>
             <Textarea placeholder="Type your message here." />
             <div className="flex items-center space-x-2"><Checkbox id="terms-check" /><Label htmlFor="terms-check">Accept terms</Label></div>
             <RadioGroup defaultValue="option-one"><div className="flex items-center space-x-2"><RadioGroupItem value="option-one" id="r1" /><Label htmlFor="r1">Option One</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="option-two" id="r2" /><Label htmlFor="r2">Option Two</Label></div></RadioGroup>
             <div className="flex items-center space-x-2"><Switch id="airplane-mode" /><Label htmlFor="airplane-mode">Airplane Mode</Label></div>
          </ComponentDisplay>

          <ComponentDisplay id="dropdown-select" title="Dropdowns & Selects" description="For selecting options from a list.">
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open Dropdown</Button></DropdownMenuTrigger><DropdownMenuContent className="w-56"><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuItem>Settings</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            <Select><SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a fruit" /></SelectTrigger><SelectContent><SelectItem value="apple">Apple</SelectItem><SelectItem value="banana">Banana</SelectItem></SelectContent></Select>
            <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem></MenubarContent></MenubarMenu></Menubar>
          </ComponentDisplay>

          <ComponentDisplay id="notifications" title="Notifications & Dialogs" description="Components for user feedback and interaction.">
            <AlertDialog><AlertDialogTrigger asChild><Button variant="outline">Alert Dialog</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            <Dialog><DialogTrigger asChild><Button>Dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit Profile</DialogTitle><DialogDescription>Make changes here.</DialogDescription></DialogHeader><p>Dialog content.</p><DialogFooter><Button type="submit">Save</Button></DialogFooter></DialogContent></Dialog>
            <Button onClick={() => sonnerToast("A Sonner toast has appeared.")}>Sonner Toast</Button>
            <Button variant="secondary" onClick={() => { shadcnToast({ title: "A Shadcn toast appeared.", description: "With a description." })}}>Shadcn Toast</Button>
            <Alert><Terminal className="h-4 w-4" /><AlertTitle>Heads up!</AlertTitle><AlertDescription>This is an alert component.</AlertDescription></Alert>
          </ComponentDisplay>
          
          <ComponentDisplay id="navigation" title="Navigation" description="Components for navigating the application.">
              <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination>
              <Tabs defaultValue="account" className="w-[400px]"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Account content.</TabsContent></Tabs>
              <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          </ComponentDisplay>
          
           <ComponentDisplay id="data-display" title="Data Display" description="For displaying structured data and information.">
              <Table><TableCaption>A list of recent invoices.</TableCaption><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>INV001</TableCell><TableCell>$250.00</TableCell></TableRow></TableBody></Table>
              <div className="flex items-center space-x-4"><Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar><div><p>shadcn</p></div></div>
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon"><HomeIcon/></Button></TooltipTrigger><TooltipContent><p>Home</p></TooltipContent></Tooltip></TooltipProvider>
          </ComponentDisplay>

           <ComponentDisplay id="loaders-feedback" title="Loaders & Feedback" description="Visual feedback for async operations.">
              <Progress value={progress} className="w-3/5" />
              <div className="flex items-center space-x-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[250px]" /><Skeleton className="h-4 w-[200px]" /></div></div>
          </ComponentDisplay>

        </div>
      </div>
    </Layout>
  );
}