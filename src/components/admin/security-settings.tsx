
"use client";
import type React from "react";
import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import type { Factor } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";

export default function SecuritySettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const router = useRouter();

  const loadFactors = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError("Failed to load MFA factors: " + factorsError.message);
      setFactors([]);
    } else {
      setFactors(data?.totp || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleUnenroll = async (factorId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this MFA method? You might be logged out or lose access if it's your only method.",
      )
    ) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (unenrollError) {
      setError("Failed to unenroll MFA: " + unenrollError.message);
      setIsLoading(false);
    } else {
      setSuccess("MFA method removed successfully.");
      await loadFactors();
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        router.push("/admin/login");
      } else {
        setIsLoading(false);
      }
    }
  };

  const mfaEnabled = factors.some((f) => f.status === "verified");

   const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    
    setIsUpdatingPassword(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);

    if (updateError) {
      setPasswordError("Failed to update password: " + updateError.message);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <div className="space-y-8">
        <header>
            <h2 className="text-2xl font-black uppercase">Security Settings</h2>
            <p className="text-muted-foreground">Manage your account security and two-factor authentication.</p>
        </header>

        {success && <Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
        {error && <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
            <CardDescription>
              {mfaEnabled
                ? "MFA is currently active on your account."
                : factors.length > 0
                  ? "You have MFA factors registered but not verified."
                  : "Add an extra layer of security."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant={mfaEnabled ? "default" : "secondary"}>
                {mfaEnabled ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                {mfaEnabled ? "AAL2 Active" : factors.length > 0 ? "Factors Registered" : "Not Setup"}
            </Badge>

            {isLoading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading MFA status...</div>}

            {!isLoading && factors.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-foreground">Registered Authenticators:</h4>
                {factors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between rounded-none border-2 border-foreground bg-secondary/50 p-3">
                    <div>
                      <p className="text-sm font-bold">{factor.friendly_name || `Authenticator (ID: ...${factor.id.slice(-6)})`}</p>
                      <p className="text-xs text-muted-foreground">Status: {factor.status}</p>
                    </div>
                    <Button onClick={() => handleUnenroll(factor.id)} variant="destructive" size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
             {!isLoading && factors.length === 0 && !error && (
              <p className="text-sm text-muted-foreground pt-2">No MFA methods are currently set up.</p>
            )}
          </CardContent>
          <CardFooter>
             <Button onClick={() => router.push("/admin/setup-mfa")} disabled={isLoading}>
              {factors.length > 0 ? "Add Another Authenticator" : "Set Up MFA Now"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password. Use a strong, unique password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                </div>
                {passwordError && <p className="text-sm font-bold text-destructive">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm font-bold text-green-600">{passwordSuccess}</p>}
                <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword}>
                  {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    {[
                        "Keep your authenticator app secure and backed up.",
                        "Do not share your password or MFA codes.",
                        "Use a strong, unique password for admin access.",
                        "Log out when you finish managing your site.",
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start">
                        <KeyRound className="mr-3 mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}