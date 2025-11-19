// src/components/admin/SiteSettingsManager.tsx
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type PortfolioMode = 'multi-page' | 'single-page';

export default function SiteSettingsManager() {
  const [mode, setMode] = useState<PortfolioMode>('multi-page');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("site_settings").select("portfolio_mode").single();
      if (data) setMode(data.portfolio_mode as PortfolioMode);
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase.from("site_settings").update({ portfolio_mode: mode }).eq("id", 1);
    if (error) { toast.error("Failed to save settings", { description: error.message }); }
    else { toast.success("Portfolio mode updated successfully!"); }
    setIsLoading(false);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Site Settings</h2>
        <p className="text-muted-foreground">Manage global settings for your portfolio's structure and layout.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Layout Mode</CardTitle>
          <CardDescription>Choose how visitors navigate your content.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(value: PortfolioMode) => setMode(value)}>
            <div className="flex items-start space-x-3 rounded-md border p-4">
              <RadioGroupItem value="multi-page" id="multi-page" />
              <Label htmlFor="multi-page" className="flex flex-col space-y-1">
                <span className="font-semibold">Multi-Page</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Traditional site with separate pages for Projects, About, etc. All navigation links are shown.
                </span>
              </Label>
            </div>
            <div className="flex items-start space-x-3 rounded-md border p-4">
              <RadioGroupItem value="single-page" id="single-page" />
              <Label htmlFor="single-page" className="flex flex-col space-y-1">
                <span className="font-semibold">Single-Page</span>
                <span className="text-sm font-normal text-muted-foreground">
                  All selected "Home" content appears on the main page. Most navigation links are hidden.
                </span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}