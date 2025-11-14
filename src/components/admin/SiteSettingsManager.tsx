
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface SocialLink {
  name: string;
  url: string;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("site_config").select("*").single();
      if (error) {
        toast.error("Failed to load site settings", { description: error.message });
      } else {
        setSettings(data);
        setSocialLinks(data.social_links || []);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { name: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const { id, updated_at, ...settingsToUpdate } = settings;
    settingsToUpdate.social_links = socialLinks;

    const { error } = await supabase.from("site_config").update(settingsToUpdate).eq("id", id);
    if (error) {
      toast.error("Failed to save settings", { description: error.message });
    } else {
      toast.success("Site settings updated successfully!");
    }
    setIsLoading(false);
  };

  if (isLoading && !settings) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site-wide Settings</h2>
        <p className="text-muted-foreground">Manage global content like hero text and social links.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="hero_name">Name</Label><Input id="hero_name" name="hero_name" value={settings?.hero_name || ""} onChange={handleInputChange} /></div>
          <div><Label htmlFor="hero_title">Title / Tagline</Label><Input id="hero_title" name="hero_title" value={settings?.hero_title || ""} onChange={handleInputChange} /></div>
          <div><Label htmlFor="hero_bio">Bio</Label><Textarea id="hero_bio" name="hero_bio" value={settings?.hero_bio || ""} onChange={handleInputChange} /></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Social Links</CardTitle>
            <Button size="sm" variant="outline" onClick={addSocialLink}><Plus className="mr-2 size-4" /> Add Link</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input placeholder="Name (e.g., GitHub)" value={link.name} onChange={(e) => handleSocialLinkChange(index, "name", e.target.value)} />
              <Input placeholder="URL" value={link.url} onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)} />
              <Button size="icon" variant="destructive" onClick={() => removeSocialLink(index)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Footer</CardTitle></CardHeader>
        <CardContent>
          <div><Label htmlFor="footer_text">Footer Text</Label><Input id="footer_text" name="footer_text" value={settings?.footer_text || ""} onChange={handleInputChange} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
