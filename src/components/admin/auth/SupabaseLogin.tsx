/*
This file is updated to align with the new neo-brutalist design system.
- All minimalist styles are replaced with hard shadows, thick borders, and `rounded-none`.
- The layout is functional, using high-contrast colors.
- Switched to the 'Space Mono' font via the `font-sans` class for a raw, technical feel.
- Replaced UI kit components with their redesigned neo-brutalist versions (`Input`, `Button`).
- The color palette is stark and high-contrast. The icon is contained in a sharp-edged, bordered container.
*/
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel === "aal2") {
          router.replace("/admin/dashboard");
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      setError(signInError.message || "Invalid login credentials.");
      return;
    }

    if (data.session) {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        setIsLoading(false);
        setError(aalError.message || "Could not verify MFA status.");
        return;
      }

      if (aalData.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
      } else if (
        aalData.currentLevel === "aal1" &&
        aalData.nextLevel === "aal2"
      ) {
        router.replace("/admin/mfa-challenge");
      } else {
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors();
        if (factorsError) {
          setIsLoading(false);
          setError(factorsError.message || "Could not list MFA factors.");
          return;
        }
        const totpFactor = factorsData?.totp?.find(
          (factor) => factor.status === "verified",
        );
        if (totpFactor) {
          router.replace("/admin/mfa-challenge");
        } else {
          router.replace("/admin/setup-mfa");
        }
      }
    } else {
      setIsLoading(false);
      setError("Login failed. Please try again.");
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      key="login-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.1 }}
      className="flex min-h-screen items-center justify-center bg-background px-4 font-sans"
    >
      <div className="w-full max-w-sm space-y-8 rounded-none border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#FFF]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-foreground bg-secondary">
            <Lock className="size-6 text-foreground" />
          </div>
          <h2 className="text-3xl font-black uppercase text-foreground">Admin Access</h2>
          <p className="mt-2 text-muted-foreground">
            Enter credentials to continue.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-none border-2 border-destructive bg-destructive/10 p-3"
              >
                <p className="text-sm font-bold text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}