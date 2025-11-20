// src/components/admin/SiteSettingsManager.tsx
"use client";

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/store/api/adminApi';
import type { SiteContent } from '@/types';

const socialLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  is_visible: z.boolean(),
});

const settingsFormSchema = z.object({
  portfolio_mode: z.enum(['multi-page', 'single-page']),
  profile_data: z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
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
        items: z.array(z.string()).transform(items => items.filter(item => item.trim() !== '')),
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
      sort_by: z.enum(['pushed', 'created', 'updated']),
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
    portfolio_mode: 'multi-page',
    profile_data: {
        name: '',
        title: '',
        description: '',
        profile_picture_url: '',
        show_profile_picture: true,
        logo: { main: '', highlight: '' },
        bio: [''],
        status_panel: {
            title: 'Status Panel',
            availability: '',
            currently_exploring: { title: 'Exploring', items: [''] },
            latestProject: { name: '', linkText: '', href: '' }
        },
        github_projects_config: {
            username: '', show: true, sort_by: 'pushed', exclude_forks: true,
            exclude_archived: true, exclude_profile_repo: true, min_stars: 1, projects_per_page: 9,
        }
    },
    social_links: [
        { id: 'github', label: 'GitHub', url: '', is_visible: true },
        { id: 'linkedin', label: 'LinkedIn', url: '', is_visible: true },
        { id: 'email', label: 'Email', url: '', is_visible: true },
    ],
    footer_data: {
        copyright_text: '',
    },
};

export default function SiteSettingsManager() {
  const { data: settingsData, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSubmitting }] = useUpdateSiteSettingsMutation();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (settingsData) {
      const { identity, settings } = settingsData;
      
      const fetchedSocials = (identity.social_links as any[]) || [];
      const mergedSocials = (defaultValues.social_links || []).map(def => {
        const fetched = fetchedSocials.find(f => f.id === def.id);
        return fetched ? { ...def, ...fetched } : def;
      });

      const mergedProfileData = {
        ...defaultValues.profile_data,
        ...identity.profile_data,
        bio: identity.profile_data.bio?.length ? identity.profile_data.bio : [''],
        status_panel: { 
            ...defaultValues.profile_data.status_panel, 
            ...identity.profile_data.status_panel, 
            currently_exploring: { 
                ...defaultValues.profile_data.status_panel.currently_exploring, 
                ...identity.profile_data.status_panel.currently_exploring, 
                items: identity.profile_data.status_panel.currently_exploring.items?.length ? identity.profile_data.status_panel.currently_exploring.items : [''] 
            } 
        },
        github_projects_config: { 
            ...defaultValues.profile_data.github_projects_config, 
            ...identity.profile_data.github_projects_config 
        },
      };

      form.reset({
        portfolio_mode: settings.portfolio_mode as 'multi-page' | 'single-page',
        profile_data: mergedProfileData,
        social_links: mergedSocials,
        footer_data: identity.footer_data,
      });
    }
  }, [settingsData, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    const { portfolio_mode, ...identityValues } = values;
    try {
        await updateSiteSettings({
            identity: identityValues,
            settings: { portfolio_mode }
        }).unwrap();
        toast.success("Site settings updated successfully!");
    } catch(err: any) {
        toast.error("Failed to save settings", { description: err.message });
    }
  };
  
  if (isLoadingSettings) {
    return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground">Manage global settings for your portfolio's identity, content, and layout.</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />} Save All Settings
        </Button>
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
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
                    <FormLabel>Logo Highlight Text</FormLabel>
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
                    <FormDescription>Display your avatar on the "About" page.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero & About Content</CardTitle>
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
                  <FormLabel>About Page Bio (Paragraph 1 - Markdown)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
                <FormField control={form.control} name="profile_data.bio.1" render={({ field }) => (<FormItem>
                  <FormLabel>About Page Bio (Paragraph 2 - Markdown)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
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

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.getValues('social_links').map((field, index) => (
                  <div key={field.id} className="space-y-2">
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
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GitHub Projects Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="profile_data.github_projects_config.show" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show GitHub Projects Section</FormLabel>
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
                    <FormLabel>Projects Per Page</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>)} />
                </div>
                <div className="space-y-2 pt-2">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Status Panel</CardTitle>
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
                <CardTitle>Global Layout</CardTitle>
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
          </div>
        </form>
      </Form>
    </div>
  );
}