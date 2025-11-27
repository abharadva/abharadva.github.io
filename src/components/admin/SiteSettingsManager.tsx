// src/components/admin/SiteSettingsManager.tsx
"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Fingerprint, BookUser, Palette, Link as LinkIcon, Github, PanelRightOpen, LayoutDashboard, Footprints } from "lucide-react";
import { Separator } from "../ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from "@/store/api/adminApi";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const socialLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  is_visible: z.boolean(),
});

const settingsFormSchema = z.object({
  portfolio_mode: z.enum(["multi-page", "single-page"]),
  profile_data: z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
    default_theme: z.string(),
    custom_theme_colors: z.object({
      background: z.string().default("#0f172a"),
      foreground: z.string().default("#e2e8f0"),
      primary: z.string().default("#0ea5e9"),
      secondary: z.string().default("#1e293b"),
      accent: z.string().default("#38bdf8"),
      card: z.string().default("#1e293b"),
    }).optional(),
    description: z.string().min(1, "Hero description is required"),
    profile_picture_url: z.string().url("Must be a valid URL").or(z.literal("")),
    show_profile_picture: z.boolean(),
    logo: z.object({
      main: z.string().min(1, "Main logo text is required"),
      highlight: z.string().min(1, "Highlight logo text is required"),
    }),
    bio: z.array(z.string()).min(1, "At least one bio paragraph is required"),
    status_panel: z.object({
      title: z.string(),
      availability: z.string().min(1, "Availability text is required"),
      currently_exploring: z.object({
        title: z.string(),
        items: z.array(z.string()).transform((items) => items.filter((item) => item.trim() !== "")),
      }),
      latestProject: z.object({
        name: z.string().min(1, "Project name is required"),
        linkText: z.string().min(1, "Link text is required"),
        href: z.string().min(1, "Project URL path is required"),
      }),
    }),
    github_projects_config: z.object({
      username: z.string().min(1, "GitHub username is required."),
      show: z.boolean(),
      sort_by: z.enum(["pushed", "created", "updated"]),
      exclude_forks: z.boolean(),
      exclude_archived: z.boolean(),
      exclude_profile_repo: z.boolean(),
      min_stars: z.coerce.number().min(0, "Cannot be negative."),
      projects_per_page: z.coerce.number().min(1, "Must be at least 1.").max(100, "Max is 100."),
    }),
  }),
  social_links: z.array(socialLinkSchema),
  footer_data: z.object({
    copyright_text: z.string().min(1, "Copyright text is required"),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const defaultValues: SettingsFormValues = {
  portfolio_mode: "multi-page",
  profile_data: {
    name: "", title: "", description: "", profile_picture_url: "",
    default_theme: "theme-blueprint",
    custom_theme_colors: { background: "#0f172a", foreground: "#e2e8f0", primary: "#0ea5e9", secondary: "#1e293b", accent: "#38bdf8", card: "#1e293b" },
    show_profile_picture: true,
    logo: { main: "", highlight: "" },
    bio: [""],
    status_panel: { title: "Status Panel", availability: "", currently_exploring: { title: "Exploring", items: [""] }, latestProject: { name: "", linkText: "", href: "" } },
    github_projects_config: { username: "", show: true, sort_by: "pushed", exclude_forks: true, exclude_archived: true, exclude_profile_repo: true, min_stars: 1, projects_per_page: 9, },
  },
  social_links: [
    { id: "github", label: "GitHub", url: "", is_visible: true },
    { id: "linkedin", label: "LinkedIn", url: "", is_visible: true },
    { id: "email", label: "Email", url: "", is_visible: true },
  ],
  footer_data: { copyright_text: "" },
};

const SettingsSkeleton = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-40" />
    </div>
    <Separator />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  </div>
);

export default function SiteSettingsManager() {
  const { data: settingsData, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSubmitting }] = useUpdateSiteSettingsMutation();

  const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues });

  useEffect(() => {
    if (settingsData) {
      const nullsToStrings = (obj: any): any => {
        if (obj === null || obj === undefined) return ""; if (typeof obj !== "object") return obj; if (Array.isArray(obj)) return obj.map(nullsToStrings);
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, nullsToStrings(value)]));
      };
      const cleanIdentity = nullsToStrings(settingsData);
      const fetchedSocials = (cleanIdentity.social_links as any[]) || [];
      const mergedSocials = (defaultValues.social_links || []).map((def) => { const fetched = fetchedSocials.find((f) => f.id === def.id); return fetched ? { ...def, ...fetched } : def; });
      const fetchedColors = cleanIdentity.profile_data.custom_theme_colors || {};
      const defaultColors = defaultValues.profile_data.custom_theme_colors!;
      const mergedColors = { background: fetchedColors.background || defaultColors.background, foreground: fetchedColors.foreground || defaultColors.foreground, primary: fetchedColors.primary || defaultColors.primary, secondary: fetchedColors.secondary || defaultColors.secondary, accent: fetchedColors.accent || defaultColors.accent, card: fetchedColors.card || defaultColors.card };
      const mergedProfileData = {
        ...defaultValues.profile_data, ...cleanIdentity.profile_data, custom_theme_colors: mergedColors,
        logo: { ...defaultValues.profile_data.logo, ...(cleanIdentity.profile_data.logo || {}) },
        status_panel: {
          ...defaultValues.profile_data.status_panel, ...(cleanIdentity.profile_data.status_panel || {}),
          currently_exploring: { ...defaultValues.profile_data.status_panel.currently_exploring, ...(cleanIdentity.profile_data.status_panel?.currently_exploring || {}), items: cleanIdentity.profile_data.status_panel?.currently_exploring?.items?.length ? cleanIdentity.profile_data.status_panel.currently_exploring.items : [""] },
          latestProject: { ...defaultValues.profile_data.status_panel.latestProject, ...(cleanIdentity.profile_data.status_panel?.latestProject || {}) },
        },
        github_projects_config: { ...defaultValues.profile_data.github_projects_config, ...(cleanIdentity.profile_data.github_projects_config || {}) },
        bio: cleanIdentity.profile_data.bio?.length ? cleanIdentity.profile_data.bio : [""],
      };
      form.reset({ portfolio_mode: settingsData.portfolio_mode || "multi-page", profile_data: mergedProfileData, social_links: mergedSocials, footer_data: cleanIdentity.footer_data || defaultValues.footer_data });
    }
  }, [settingsData, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSiteSettings(values).unwrap();
      toast.success("Site settings updated successfully!");
    } catch (err: any) { toast.error("Failed to save settings", { description: err.message }); }
  };

  if (isLoadingSettings) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-sm -mx-8 px-8 py-4 -mt-4 mb-2 border-b">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold">Site Settings</h2>
            <p className="text-muted-foreground text-sm">Manage global settings for your portfolio's identity and layout.</p>
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />} Save Changes
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="size-5 text-primary" /> Brand Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="profile_data.name" render={({ field }) => (<FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="profile_data.logo.main" render={({ field }) => (<FormItem>
                    <FormLabel>Logo Main Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="AKSHAY" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)} />
                  <FormField control={form.control} name="profile_data.logo.highlight" render={({ field }) => (<FormItem>
                    <FormLabel>Logo Highlight</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder=".DEV" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)} />
                </div>
                <FormField control={form.control} name="profile_data.profile_picture_url" render={({ field }) => (<FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.show_profile_picture" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show Profile Picture</FormLabel>
                    <FormDescription>Display avatar on "About" page.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookUser className="size-5 text-primary" /> Hero & About Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="profile_data.title" render={({ field }) => (<FormItem>
                  <FormLabel>Hero Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full-Stack Developer." />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.description" render={({ field }) => (<FormItem>
                  <FormLabel>Hero Description (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <Separator />
                <FormField control={form.control} name="profile_data.bio.0" render={({ field }) => (<FormItem>
                  <FormLabel>About Bio (Paragraph 1)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.bio.1" render={({ field }) => (<FormItem>
                  <FormLabel>About Bio (Paragraph 2)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="size-5 text-primary" /> GitHub Projects Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="profile_data.github_projects_config.show" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show GitHub Section</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.github_projects_config.username" render={({ field }) => (<FormItem>
                  <FormLabel>GitHub Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="your-username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Advanced Options</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <FormField control={form.control} name="profile_data.github_projects_config.sort_by" render={({ field }) => (<FormItem>
                        <FormLabel>Sort Repos By</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pushed">Last Pushed</SelectItem>
                            <SelectItem value="updated">Last Updated</SelectItem>
                            <SelectItem value="created">Created Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>)} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="profile_data.github_projects_config.min_stars" render={({ field }) => (<FormItem>
                          <FormLabel>Min Stars</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>)} />
                        <FormField control={form.control} name="profile_data.github_projects_config.projects_per_page" render={({ field }) => (<FormItem>
                          <FormLabel>Per Page</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>)} />
                      </div>
                      <div className="space-y-3 pt-2">
                        <FormField control={form.control} name="profile_data.github_projects_config.exclude_forks" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Exclude Forks</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>)} />
                        <FormField control={form.control} name="profile_data.github_projects_config.exclude_archived" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Exclude Archived</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>)} />
                        <FormField control={form.control} name="profile_data.github_projects_config.exclude_profile_repo" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between">
                          <FormLabel>Exclude Profile Repo</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>)} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5 text-primary" /> Theme Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="presets">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                  <TabsContent value="presets" className="space-y-4">
                    <FormField control={form.control} name="profile_data.default_theme" render={({ field }) => (<FormItem>
                      <FormLabel>Select Preset</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-64">
                          <SelectItem value="theme-blueprint">Blueprint</SelectItem>
                          <SelectItem value="theme-matrix">Matrix</SelectItem>
                          <SelectItem value="theme-solarized-light">Solarized Light</SelectItem>
                          <SelectItem value="theme-monokai">Monokai</SelectItem>
                          <SelectItem value="theme-cyberpunk">Cyberpunk Neon</SelectItem>
                          <SelectItem value="theme-ocean">Ocean Deep</SelectItem>
                          <SelectItem value="theme-sunset">Sunset Blaze</SelectItem>
                          <SelectItem value="theme-forest">Forest Night</SelectItem>
                          <SelectItem value="theme-royal">Royal Purple</SelectItem>
                          <SelectItem value="theme-crimson">Midnight Crimson</SelectItem>
                          <SelectItem value="theme-arctic">Arctic Frost</SelectItem>
                          <SelectItem value="theme-dracula">Dracula</SelectItem>
                          <SelectItem value="theme-coffee">Coffee Shop</SelectItem>
                          <SelectItem value="theme-violet">Electric Violet</SelectItem>
                          <SelectItem value="theme-vaporwave">Vaporwave Dream</SelectItem>
                          <SelectItem value="theme-tokyo">Neon Tokyo</SelectItem>
                          <SelectItem value="theme-aurora">Aurora Borealis</SelectItem>
                          <SelectItem value="theme-candy">Candy Pop</SelectItem>
                          <SelectItem value="theme-synthwave">Synthwave Sunset</SelectItem>
                          <SelectItem value="theme-tropical">Tropical Paradise</SelectItem>
                          <SelectItem value="theme-cosmic">Cosmic Space</SelectItem>
                          <SelectItem value="theme-sakura">Cherry Blossom</SelectItem>
                          <SelectItem value="theme-gruvbox">Gruvbox</SelectItem>
                          <SelectItem value="theme-outrun">Outrun</SelectItem>
                          <SelectItem value="theme-nord">Nord</SelectItem>
                          <SelectItem value="theme-catppuccin-mocha">Catppuccin Mocha</SelectItem>
                          <SelectItem value="theme-catppuccin-latte">Catppuccin Latte</SelectItem>
                          <SelectItem value="theme-tokyo-night">Tokyo Night</SelectItem>
                          <SelectItem value="theme-tokyo-storm">Tokyo Night Storm</SelectItem>
                          <SelectItem value="theme-kanagawa">Kanagawa</SelectItem>
                          <SelectItem value="theme-rose-pine">Rosé Pine</SelectItem>
                          <SelectItem value="theme-rose-pine-dawn">Rosé Pine Dawn</SelectItem>
                          <SelectItem value="theme-onedark-pro">One Dark Pro</SelectItem>
                          <SelectItem value="theme-nightfox">Nightfox</SelectItem>
                          <SelectItem value="theme-github-dark">GitHub Dark</SelectItem>
                          <SelectItem value="theme-ayu-dark">Ayu Dark</SelectItem>
                          <SelectItem value="theme-everforest-dark">Everforest Dark</SelectItem>
                          <SelectItem value="theme-material-palenight">Material Palenight</SelectItem>
                          <SelectItem value="theme-vesper">Vesper</SelectItem>
                          <SelectItem value="theme-everforest-light">Everforest Light</SelectItem>
                          <SelectItem value="theme-github-light">GitHub Light</SelectItem>
                          <SelectItem value="theme-ayu-light">Ayu Light</SelectItem>
                          <SelectItem value="theme-retrowave">Retro Wave</SelectItem>
                          <SelectItem value="theme-blade-runner">Blade Runner</SelectItem>
                          <SelectItem value="theme-terminal-green">Terminal Green</SelectItem>
                          <SelectItem value="theme-amber-crt">Amber CRT</SelectItem>
                          <SelectItem value="theme-lavender">Lavender Fields</SelectItem>
                          <SelectItem value="theme-midnight-blue">Midnight Blue</SelectItem>
                          <SelectItem value="theme-autumn">Autumn Harvest</SelectItem>
                          <SelectItem value="theme-jade">Jade Garden</SelectItem>
                          <SelectItem value="theme-desert">Desert Dusk</SelectItem>
                          <SelectItem value="theme-hc-dark">High Contrast Dark</SelectItem>
                          <SelectItem value="theme-hc-light">High Contrast Light</SelectItem>
                          <SelectItem value="theme-paper">Paper White</SelectItem>
                          <SelectItem value="theme-charcoal">Charcoal</SelectItem>
                          <SelectItem value="theme-nebula">Nebula</SelectItem>
                          <SelectItem value="theme-neon-noir">Neon Noir</SelectItem>
                          <SelectItem value="theme-peacock">Peacock</SelectItem>
                          <SelectItem value="theme-flame">Flame</SelectItem>
                          <SelectItem value="theme-winter">Winter Frost</SelectItem>
                          <SelectItem value="theme-spring">Spring Meadow</SelectItem>
                          <SelectItem value="theme-summer">Summer Beach</SelectItem>
                          <SelectItem value="theme-corporate">Corporate Blue</SelectItem>
                          <SelectItem value="theme-executive">Executive Gray</SelectItem>
                          <SelectItem value="theme-razer">Razer Green</SelectItem>
                          <SelectItem value="theme-discord">Discord</SelectItem>
                          <SelectItem value="theme-steam">Steam</SelectItem>
                          <SelectItem value="theme-twitter-dark">Twitter/X Dark</SelectItem>
                          <SelectItem value="theme-instagram">Instagram Gradient</SelectItem>
                          <SelectItem value="theme-apple-dark">Apple Dark</SelectItem>
                          <SelectItem value="theme-microsoft">Microsoft</SelectItem>
                          <SelectItem value="theme-watermelon">Watermelon</SelectItem>
                          <SelectItem value="theme-mint-chocolate">Mint Chocolate</SelectItem>
                          <SelectItem value="theme-bubblegum">Bubblegum</SelectItem>
                          <SelectItem value="theme-gold-noir">Gold Noir</SelectItem>
                          <SelectItem value="theme-platinum">Platinum</SelectItem>
                          <SelectItem value="theme-rose-gold">Rose Gold</SelectItem>
                          <SelectItem value="theme-emerald-luxe">Emerald Luxe</SelectItem>
                          <SelectItem value="theme-sapphire">Sapphire Royal</SelectItem>
                          <SelectItem value="theme-pastel-rainbow">Pastel Rainbow</SelectItem>
                          <SelectItem value="theme-peach-cream">Peach Cream</SelectItem>
                          <SelectItem value="theme-cotton-candy">Cotton Candy</SelectItem>
                          <SelectItem value="theme-terracotta">Terracotta</SelectItem>
                          <SelectItem value="theme-moss">Moss</SelectItem>
                          <SelectItem value="theme-galactic">Galactic Purple</SelectItem>
                          <SelectItem value="theme-alien">Alien Green</SelectItem>
                          <SelectItem value="theme-starlight">Starlight</SelectItem>
                          <SelectItem value="theme-espresso">Espresso</SelectItem>
                          <SelectItem value="theme-matcha">Matcha</SelectItem>
                          <SelectItem value="theme-berry">Berry Blast</SelectItem>
                          <SelectItem value="theme-neobrutalism-light">Neobrutalism Light</SelectItem>
                          <SelectItem value="theme-neobrutalism-dark">Neobrutalism Dark</SelectItem>
                          <SelectItem value="theme-neobrutalism-color">Neobrutalism Colorful</SelectItem>
                          <SelectItem value="theme-neobrutalism-retro">Neobrutalism Retro</SelectItem>
                          <SelectItem value="theme-neobrutalism-punk">Neobrutalism Punk</SelectItem>
                          <SelectItem value="theme-glass-light">Glass Light</SelectItem>
                          <SelectItem value="theme-glass-dark">Glass Dark</SelectItem>
                          <SelectItem value="theme-glass-aurora">Glass Aurora</SelectItem>
                          <SelectItem value="theme-glass-ocean">Glass Ocean</SelectItem>
                          <SelectItem value="theme-glass-frost">Glass Frost</SelectItem>
                          <SelectItem value="theme-glass-sunset">Glass Sunset</SelectItem>
                          <SelectItem value="theme-glass-neon">Glass Neon</SelectItem>
                          <SelectItem value="theme-glass-mint">Glass Mint</SelectItem>
                          <SelectItem value="theme-pure-minimalist">Pure Minimalist</SelectItem>
                          <SelectItem value="theme-soft-grayscale">Soft Gray Scale</SelectItem>
                          <SelectItem value="theme-monochrome-pro">Monochrome Professional</SelectItem>
                          <SelectItem value="theme-zen-white">Zen White</SelectItem>
                          <SelectItem value="theme-swiss-design">Swiss Design</SelectItem>
                          <SelectItem value="theme-midnight-dev">Midnight Developer</SelectItem>
                          <SelectItem value="theme-carbon-fiber">Carbon Fiber</SelectItem>
                          <SelectItem value="theme-slate-pro">Slate Professional</SelectItem>
                          <SelectItem value="theme-obsidian-code">Obsidian Code</SelectItem>
                          <SelectItem value="theme-graphite-studio">Graphite Studio</SelectItem>
                          <SelectItem value="theme-coral-reef">Coral Reef</SelectItem>
                          <SelectItem value="theme-electric-lime">Electric Lime</SelectItem>
                          <SelectItem value="theme-magenta-burst">Magenta Burst</SelectItem>
                          <SelectItem value="theme-tangerine-dream">Tangerine Dream</SelectItem>
                          <SelectItem value="theme-ruby-red">Ruby Red</SelectItem>
                          <SelectItem value="theme-quantum-blue">Quantum Blue</SelectItem>
                          <SelectItem value="theme-holographic">Holographic</SelectItem>
                          <SelectItem value="theme-cyber-matrix">Cyber Matrix</SelectItem>
                          <SelectItem value="theme-neon-grid">Neon Grid</SelectItem>
                          <SelectItem value="theme-digital-lavender">Digital Lavender</SelectItem>
                          <SelectItem value="theme-mocha-mousse">Mocha Mousse</SelectItem>
                          <SelectItem value="theme-verdant-green">Verdant Green</SelectItem>
                          <SelectItem value="theme-bamboo-forest">Bamboo Forest</SelectItem>
                          <SelectItem value="theme-desert-sand">Desert Sand</SelectItem>
                          <SelectItem value="theme-code-editor">Code Editor Dark</SelectItem>
                          <SelectItem value="theme-github-pro">GitHub Professional</SelectItem>
                          <SelectItem value="theme-tokyo-dev">Tokyo Night Dev</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Uses a pre-defined color palette.</FormDescription>
                      <FormMessage />
                    </FormItem>)} />
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-secondary/30">
                      <Label className="cursor-pointer" onClick={() => form.setValue('profile_data.default_theme', 'theme-custom')}>Enable Custom Theme</Label>
                      <Switch checked={form.watch('profile_data.default_theme') === 'theme-custom'} onCheckedChange={(c) => form.setValue('profile_data.default_theme', c ? 'theme-custom' : 'theme-blueprint')} />

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {['background', 'foreground', 'primary', 'secondary', 'accent', 'card'].map((colorKey) => (<FormField key={colorKey} control={form.control} name={`profile_data.custom_theme_colors.${colorKey}` as any} render={({ field }) => (<FormItem>
                        <FormLabel className="capitalize">{colorKey}</FormLabel>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-md border overflow-hidden shrink-0">
                            <input type="color" className="absolute inset-0 w-16 h-16 -top-2 -left-2 cursor-pointer" {...field} />
                          </div>
                          <FormControl>
                            <Input {...field} className="font-mono text-xs" />
                          </FormControl>
                        </div>
                      </FormItem>)} />))}
                    </div>

                    <div
                      className="mt-4 p-4 rounded-lg border shadow-lg"
                      style={{
                        backgroundColor: form.watch(
                          "profile_data.custom_theme_colors.background",
                        ),
                        color: form.watch(
                          "profile_data.custom_theme_colors.foreground",
                        ),
                        borderColor: form.watch(
                          "profile_data.custom_theme_colors.secondary",
                        ),
                      }}
                    >
                      <h4 className="font-bold text-lg mb-2">Preview</h4>
                      <p className="mb-3 text-sm opacity-80">
                        This is how your custom theme looks.
                      </p>
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{
                          backgroundColor: form.watch(
                            "profile_data.custom_theme_colors.primary",
                          ),
                          color: form.watch(
                            "profile_data.custom_theme_colors.background",
                          ),
                        }}
                      >
                        Primary Button
                      </button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="size-5 text-primary" /> Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.getValues("social_links").map((field, index) => (<div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>{field.label}</FormLabel>
                    <FormField control={form.control} name={`social_links.${index}.is_visible`} render={({ field: switchField }) => (<FormItem>
                      <FormControl>
                        <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
                      </FormControl>
                    </FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`social_links.${index}.url`} render={({ field: urlField }) => (<FormItem>
                    <FormControl>
                      <Input {...urlField} placeholder={`Enter ${field.label} URL`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)} />
                </div>))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PanelRightOpen className="size-5 text-primary" /> Hero Status Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="profile_data.status_panel.availability" render={({ field }) => (<FormItem>
                  <FormLabel>Availability</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.status_panel.currently_exploring.items.0" render={({ field }) => (<FormItem>
                  <FormLabel>Exploring #1</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.status_panel.currently_exploring.items.1" render={({ field }) => (<FormItem>
                  <FormLabel>Exploring #2</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>)} />
                <Separator />
                <FormField control={form.control} name="profile_data.status_panel.latestProject.name" render={({ field }) => (<FormItem>
                  <FormLabel>Latest Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.status_panel.latestProject.href" render={({ field }) => (<FormItem>
                  <FormLabel>Latest Project URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="/projects" />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="size-5 text-primary" /> Global Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="portfolio_mode" render={({ field }) => (<FormItem>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="multi-page" />
                        </FormControl>
                        <FormLabel className="font-normal">Multi-Page</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="single-page" />
                        </FormControl>
                        <FormLabel className="font-normal">Single-Page</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Footprints className="size-5 text-primary" /> Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="footer_data.copyright_text" render={({ field }) => (<FormItem>
                  <FormLabel>Copyright Text (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}