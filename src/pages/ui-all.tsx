import { cn } from "@/lib/utils";
import Layout from "@/components/layout";
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
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
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
  YAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
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
  ContextMenuPortal,
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
  DropdownMenuPortal,
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
  useFormField, // Not directly used for rendering but part of the system
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
  MenubarPortal,
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
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
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
  SelectScrollDownButton,
  SelectScrollUpButton,
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"; // Note: Sidebar is a layout system, full demo is complex

import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // This is the toaster itself, not for triggering
import { toast as sonnerToast } from "sonner"; // Function to trigger sonner toasts

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
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"; // This is the toaster itself
import { useToast as useShadcnToast } from "@/hooks/use-toast"; // Hook to trigger shadcn toasts

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React, { useState } from "react";
import {
  Terminal,
  Settings,
  User as UserIcon,
  CreditCard,
  Search as SearchIcon,
  Home as HomeIcon,
  CalendarIcon,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";

// Form schema for react-hook-form example
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(50),
  email: z.string().email({ message: "Invalid email address." }),
  channel: z.string().optional(),
  securityQuestion: z
    .string()
    .min(1, { message: "Please select a security question." }),
  sendEmails: z.boolean().default(false).optional(),
  bio: z.string().max(160).optional(),
});

// Chart config for Chart example
const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

export default function UiPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(13);
  const [sliderValue, setSliderValue] = useState([50]);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [formValue, setFormValue] = useState("");

  const { toast: shadcnToast } = useShadcnToast();

  // Form setup for react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      sendEmails: true,
      bio: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    sonnerToast.success(`Form Submitted: ${JSON.stringify(values, null, 2)}`);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const ComponentSection: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ title, children, className }) => (
    <section
      className={cn(
        "mb-16 p-6 border-2 border-black rounded-none shadow-[8px_8px_0px_#000] bg-white",
        className,
      )}
    >
      <h2 className="mb-6 border-b-2 border-black pb-2 text-3xl font-black">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );

  const SubSection: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ title, children, className }) => (
    <div
      className={cn(
        "mt-6 p-4 border-2 border-gray-300 rounded-none shadow-[3px_3px_0px_#ccc] bg-gray-50",
        className,
      )}
    >
      <h3 className="mb-3 text-xl font-bold text-gray-700">{title}</h3>
      <div className="flex flex-wrap items-start gap-4 space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 ">
        <h1 className="mb-12 border-b-4 border-black pb-4 text-center text-5xl font-black">
          UI Component Showcase
        </h1>

        <ComponentSection title="Accordion">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that matches the other
                components' aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It's animated by default, but you can disable it if you
                prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ComponentSection>

        <ComponentSection title="Alert Dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ComponentSection>

        <ComponentSection title="Alert">
          <SubSection title="Default Alert">
            <Alert>
              <Terminal className="size-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the cli.
              </AlertDescription>
            </Alert>
          </SubSection>
          <SubSection title="Destructive Alert">
            <Alert variant="destructive">
              <Terminal className="size-4" />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </Alert>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Aspect Ratio">
          <div className="w-[450px]">
            <AspectRatio
              ratio={16 / 9}
              className="rounded-none border-2 border-black bg-yellow-300 shadow-[4px_4px_0_#000]"
            >
              <img
                src="https://images.unsplash.com/photo-1573298134930-32188a48a0a0?q=80&w=800&auto=format&fit=crop"
                alt="Abstract building"
                className="size-full rounded-none object-cover"
              />
            </AspectRatio>
          </div>
        </ComponentSection>

        <ComponentSection title="Avatar">
          <SubSection title="With Image & Fallback">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/non-existent.png" alt="Fallback Demo" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Badge">
          <SubSection title="Variants">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/ui">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/ui">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </ComponentSection>

        <ComponentSection title="Button">
          <SubSection title="Variants">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </SubSection>
          <SubSection title="Sizes">
            <Button size="default">Default Size</Button>
            <Button size="sm">Small Size</Button>
            <Button size="lg">Large Size</Button>
            <Button size="icon">
              <Settings className="size-4" />
            </Button>
          </SubSection>
          <SubSection title="With Icon">
            <Button>
              {" "}
              <UserIcon className="mr-2 size-4" /> Login with Email
            </Button>
          </SubSection>
          <SubSection title="Loading State">
            <Button disabled>
              <Settings className="mr-2 size-4 animate-spin" />
              Please wait
            </Button>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Calendar">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-none border-2 border-black shadow-[6px_6px_0_#000]"
          />
          <p className="mt-2 text-sm font-semibold">
            Selected: {date?.toLocaleDateString()}
          </p>
        </ComponentSection>

        <ComponentSection title="Card">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name of your project" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="framework">Framework</Label>
                    <Select>
                      <SelectTrigger id="framework">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="next">Next.js</SelectItem>
                        <SelectItem value="sveltekit">SvelteKit</SelectItem>
                        <SelectItem value="astro">Astro</SelectItem>
                        <SelectItem value="nuxt">Nuxt.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Deploy</Button>
            </CardFooter>
          </Card>
        </ComponentSection>

        <ComponentSection title="Carousel">
          <Carousel className="mx-auto w-full max-w-xs">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center rounded-none border-2 border-black bg-yellow-200 p-6">
                        <span className="text-4xl font-bold">{index + 1}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </ComponentSection>

        <ComponentSection title="Chart">
          <SubSection title="Bar Chart">
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </SubSection>
          <SubSection title="Line Chart">
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="desktop"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-desktop)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  dataKey="mobile"
                  type="natural"
                  stroke="var(--color-mobile)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-mobile)" }}
                  activeDot={{ r: 6 }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Checkbox">
          <div className="items-top flex space-x-2">
            <Checkbox id="terms1" />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms and conditions
              </label>
              <p className="text-sm text-gray-600">
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms2" checked />
            <Label htmlFor="terms2">Pre-checked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms3" disabled />
            <Label htmlFor="terms3">Disabled</Label>
          </div>
        </ComponentSection>

        <ComponentSection title="Collapsible">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">Toggle Collapsible</Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-none border-2 border-black bg-gray-50 p-4 shadow-[2px_2px_0_#000]">
              This is the collapsible content. It can be hidden or shown.
            </CollapsibleContent>
          </Collapsible>
        </ComponentSection>

        <ComponentSection title="Command">
          <SubSection title="Basic Command">
            <Command className="w-full max-w-md rounded-none border-2 border-black shadow-[4px_4px_0_#000]">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>Calendar</CommandItem>
                  <CommandItem>Search Emoji</CommandItem>
                  <CommandItem>Calculator</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem>Profile</CommandItem>
                  <CommandItem>Billing</CommandItem>
                  <CommandItem>Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </SubSection>
          <SubSection title="Command Dialog">
            <Button onClick={() => setCommandDialogOpen(true)}>
              Open Command Dialog
            </Button>
            <CommandDialog
              open={commandDialogOpen}
              onOpenChange={setCommandDialogOpen}
            >
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Links">
                  <CommandItem onSelect={() => console.log("Selected Home")}>
                    <HomeIcon className="mr-2 size-4" />
                    <span>Home</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => console.log("Selected Calendar")}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    <span>Calendar</span>
                    <CommandShortcut>⌘K</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Context Menu">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-none border-2 border-dashed border-black bg-gray-100 text-sm font-semibold shadow-[4px_4px_0_#000]">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem inset>
                Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset disabled>
                Forward <ContextMenuShortcut>⌘]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset>
                Reload <ContextMenuShortcut>⌘R</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem>
                    Save Page As...{" "}
                    <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                  <ContextMenuItem>Name Window...</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Developer Tools</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem checked>
                Show Bookmarks Bar{" "}
                <ContextMenuShortcut>⇧⌘B</ContextMenuShortcut>
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuRadioGroup value="pedro">
                <ContextMenuLabel inset>People</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuRadioItem value="pedro">
                  Pedro Duarte
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="colm">
                  Colm Tuite
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenu>
        </ComponentSection>

        <ComponentSection title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value="Pedro Duarte"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value="@peduarte"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ComponentSection>

        <ComponentSection title="Drawer">
          <div className="grid grid-cols-2 gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open Drawer (Bottom)</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>
                    This action cannot be undone.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            {/* Example for a different side, though Vaul primarily supports bottom sheets easily */}
            <p className="rounded-none border border-dashed border-black p-4 text-sm text-gray-600">
              Note: Vaul (used by Drawer) is primarily for bottom sheets. For
              side drawers, consider the Sheet component.
            </p>
          </div>
        </ComponentSection>

        <ComponentSection title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon className="mr-2 size-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 size-4" />
                  <span>Billing</span>
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuRadioGroup value="active">
                <DropdownMenuRadioItem value="active">
                  Active
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="paused">
                  Paused
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentSection>

        <ComponentSection title="Form (with React Hook Form & Zod)">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="securityQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Question</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="q1">
                          What was your first pet's name?
                        </SelectItem>
                        <SelectItem value="q2">
                          What city were you born in?
                        </SelectItem>
                        <SelectItem value="q3">
                          What is your mother's maiden name?
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border-2 border-black bg-gray-50 p-4 shadow-[2px_2px_0_#000]">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send promotional emails</FormLabel>
                      <FormDescription>
                        You can unsubscribe at any time.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </ComponentSection>

        <ComponentSection title="Hover Card">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@nextjs</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@nextjs</h4>
                  <p className="text-sm">
                    The React Framework – created and maintained by @vercel.
                  </p>
                  <div className="flex items-center pt-2">
                    <CalendarIcon className="mr-2 size-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      Joined December 2021
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </ComponentSection>

        <ComponentSection title="Input OTP">
          <SubSection title="6-Digit OTP">
            <InputOTP
              maxLength={6}
              value={formValue}
              onChange={(value) => setFormValue(value)}
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
            <p className="text-sm">Current Value: {formValue}</p>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Input">
          <Input
            type="email"
            placeholder="Email Address"
            className="max-w-sm"
          />
        </ComponentSection>

        <ComponentSection title="Label">
          <div className="flex items-center space-x-2">
            <Checkbox id="label-demo-checkbox" />
            <Label htmlFor="label-demo-checkbox">
              Accept terms and conditions
            </Label>
          </div>
        </ComponentSection>

        <ComponentSection title="Menubar">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
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
                {/* ... more items */}
                <MenubarItem>Cut</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ComponentSection>

        <ComponentSection title="Navigation Menu">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex size-full select-none flex-col justify-end rounded-none border-2 border-black bg-gradient-to-b from-muted/50 to-muted p-6 no-underline shadow-[2px_2px_0_#000] outline-none hover:bg-yellow-100 focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-bold">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components built with Radix UI
                            and Tailwind CSS.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/ui" title="Introduction">
                      {" "}
                      Re-usable components built using Radix UI and Tailwind
                      CSS.{" "}
                    </ListItem>
                    <ListItem href="/ui" title="Installation">
                      {" "}
                      How to install dependencies and structure your app.{" "}
                    </ListItem>
                    <ListItem href="/ui" title="Typography">
                      {" "}
                      Styles for headings, paragraphs, lists...etc{" "}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/ui" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </ComponentSection>

        <ComponentSection title="Pagination">
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
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </ComponentSection>

        <ComponentSection title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold leading-none">Dimensions</h4>
                  <p className="text-sm text-gray-600">
                    Set the dimensions for the layer.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      defaultValue="100%"
                      className="col-span-2 h-8"
                    />
                  </div>
                  {/* ... more inputs ... */}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </ComponentSection>

        <ComponentSection title="Progress">
          <Progress value={progress} className="w-3/5" />
          <p className="mt-2 text-sm">Current progress: {progress}%</p>
        </ComponentSection>

        <ComponentSection title="Radio Group">
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Compact</Label>
            </div>
          </RadioGroup>
        </ComponentSection>

        <ComponentSection title="Resizable">
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[200px] max-w-md rounded-none border-2 border-black shadow-[4px_4px_0_#000]"
          >
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center border-r-2 border-black p-6">
                <span className="font-semibold">One</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Two</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentSection>

        <ComponentSection title="Scroll Area">
          <ScrollArea className="h-72 w-60 rounded-none border-2 border-black p-2 shadow-[4px_4px_0_#000]">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-bold leading-none">Tags</h4>
              {Array.from({ length: 20 }).map((_, i, a) => (
                <React.Fragment key={i}>
                  <div className="text-sm">Tag {i + 1}</div>
                  {i < a.length - 1 && <Separator className="my-2" />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </ComponentSection>

        <ComponentSection title="Select">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Vegetables</SelectLabel>
                <SelectItem value="carrot">Carrot</SelectItem>
                <SelectItem value="broccoli">Broccoli</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </ComponentSection>

        <ComponentSection title="Separator">
          <div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold leading-none">
                Radix Primitives
              </h4>
              <p className="text-sm text-gray-600">
                An open-source UI component library.
              </p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div>Blog</div>
              <Separator orientation="vertical" />
              <div>Docs</div>
              <Separator orientation="vertical" />
              <div>Source</div>
            </div>
          </div>
        </ComponentSection>

        <ComponentSection title="Sheet">
          <div className="grid grid-cols-2 gap-2">
            {(["top", "bottom", "left", "right"] as const).map((side) => (
              <Sheet key={side}>
                <SheetTrigger asChild>
                  <Button variant="outline">Open ({side})</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Edit profile ({side})</SheetTitle>
                    <SheetDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">{/* Sheet Content */}</div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button type="submit">Save changes</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </ComponentSection>

        <ComponentSection title="Sidebar (Trigger Example)">
          <SidebarProvider>
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
              <p className="text-sm font-semibold">
                Toggle Sidebar (Conceptual - Full sidebar needs page structure)
              </p>
            </div>
            {/* <Sidebar>...</Sidebar> <SidebarInset>...</SidebarInset> */}
            <p className="mt-2 text-xs text-gray-500">
              Note: Full Sidebar component demo requires specific page layout
              structure.
            </p>
          </SidebarProvider>
        </ComponentSection>

        <ComponentSection title="Skeleton">
          <div className="flex items-center space-x-4">
            <Skeleton className="size-12 rounded-none border-2 border-black" />{" "}
            {/* Avatar skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px] border-2 border-black" />
              <Skeleton className="h-4 w-[200px] border-2 border-black" />
            </div>
          </div>
        </ComponentSection>

        <ComponentSection title="Slider">
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            className="w-3/5"
          />
          <p className="mt-2 text-sm">Current Value: {sliderValue[0]}</p>
        </ComponentSection>

        <ComponentSection title="Sonner Toasts">
          <Button
            onClick={() =>
              sonnerToast("Event has been created.", {
                description: `Sunday, December 03, 2023 at 9:00 AM. Neo-Brutal style!`,
                action: {
                  label: "Undo",
                  onClick: () => console.log("Sonner Undo!"),
                },
              })
            }
          >
            Show Sonner Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              sonnerToast.error("Something went wrong!", {
                description: "This is a destructive Sonner toast.",
                duration: 5000,
              })
            }
          >
            Show Destructive Sonner Toast
          </Button>
        </ComponentSection>

        <ComponentSection title="Switch">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="dark-mode" checked />
            <Label htmlFor="dark-mode">Dark Mode (Checked)</Label>
          </div>
        </ComponentSection>

        <ComponentSection title="Table">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">INV002</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>PayPal</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">$400.00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ComponentSection>

        <ComponentSection title="Tabs">
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              Make changes to your account here.
            </TabsContent>
            <TabsContent value="password">
              Change your password here.
            </TabsContent>
          </Tabs>
        </ComponentSection>

        <ComponentSection title="Textarea">
          <Textarea
            placeholder="Type your message here."
            className="max-w-md"
          />
        </ComponentSection>

        <ComponentSection title="Toast (Shadcn)">
          <Button
            onClick={() => {
              shadcnToast({
                title: "Scheduled: Catch up",
                description: "Friday, February 10, 2023 at 5:57 PM",
                action: (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("Shadcn Toast Undo!")}
                  >
                    Undo
                  </Button>
                ),
              });
            }}
          >
            Show Shadcn Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              shadcnToast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
              });
            }}
          >
            Show Destructive Shadcn Toast
          </Button>
        </ComponentSection>

        <ComponentSection title="Toggle">
          <SubSection title="Variants & Sizes">
            <Toggle aria-label="Toggle bold">B</Toggle>
            <Toggle variant="outline" aria-label="Toggle italic">
              I
            </Toggle>
            <Toggle size="sm" aria-label="Toggle underline">
              U
            </Toggle>
            <Toggle size="lg" aria-label="Toggle strikethrough">
              S
            </Toggle>
          </SubSection>
          <SubSection title="With Text">
            <Toggle aria-label="Toggle notifications">
              <Settings className="mr-2 size-4" /> Notifications
            </Toggle>
          </SubSection>
          <SubSection title="Pressed State">
            <Toggle pressed aria-label="Toggle microphone">
              <UserIcon className="size-4" />
            </Toggle>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Toggle Group">
          <SubSection title="Default">
            <ToggleGroup type="multiple">
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                B
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                I
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                U
              </ToggleGroupItem>
            </ToggleGroup>
          </SubSection>
          <SubSection title="Outline Variant">
            <ToggleGroup variant="outline" type="single" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Left aligned">
                Left
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Center aligned">
                Center
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Right aligned">
                Right
              </ToggleGroupItem>
            </ToggleGroup>
          </SubSection>
        </ComponentSection>

        <ComponentSection title="Tooltip">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to library</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon">
                  <SearchIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ComponentSection>
      </div>
    </Layout>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-none border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:bg-yellow-100 hover:text-accent-foreground hover:border-black focus:shadow-md focus:border-black shadow-[2px_2px_0px_transparent] hover:shadow-[2px_2px_0px_#000]",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
