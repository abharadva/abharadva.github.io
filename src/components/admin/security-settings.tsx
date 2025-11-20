// src/components/admin/security-settings.tsx
"use client";
import type React from "react";
import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetMfaFactorsQuery, useUnenrollMfaFactorMutation, useUpdateUserPasswordMutation } from "@/store/api/adminApi";

export default function SecuritySettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const { data: factors = [], isLoading: isLoadingFactors, error: factorsError } = useGetMfaFactorsQuery();
  const [unenrollFactor, { isLoading: isUnenrolling }] = useUnenrollMfaFactorMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateUserPasswordMutation();

  const handleUnenroll = async (factorId: string) => {
    if (!confirm("Are you sure you want to remove this MFA method? You might be logged out or lose access if it's your only method.")) return;
    
    try {
      await unenrollFactor(factorId).unwrap();
      toast.success("MFA method removed successfully.");
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        router.push("/admin/login");
      }
    } catch(err: any) {
      toast.error("Failed to unenroll MFA", { description: err.message });
    }
  };

  const mfaEnabled = factors.some((f) => f.status === "verified");

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters long."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    
    try {
      await updatePassword(newPassword).unwrap();
      toast.success("Password updated successfully!");
      setNewPassword(""); 
      setConfirmPassword("");
    } catch(err: any) {
      setPasswordError("Failed to update password: " + err.message);
      toast.error("Password Update Failed", { description: err.message });
    }
  };
  
  const isLoading = isLoadingFactors || isUnenrolling;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-muted-foreground">Manage your account security and two-factor authentication.</p>
      </div>

      {!!factorsError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{(factorsError as any).message || 'Failed to load MFA status'}</AlertDescription></Alert>}

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
            <CardDescription>
              {mfaEnabled ? "MFA is currently active and verified on your account." : factors.length > 0 ? "You have MFA factors registered, but not all may be fully verified." : "Add an extra layer of security to your account."}
            </CardDescription>
          </div>
          <Badge variant={mfaEnabled ? "default" : "secondary"}>{mfaEnabled ? "Active" : "Inactive"}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading MFA status...</p>}
          {!isLoading && factors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Registered Authenticators:</h4>
              {factors.map((factor) => (
                <div key={factor.id} className="flex flex-col items-start gap-2 rounded-md border bg-secondary p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{factor.friendly_name || `Authenticator (ID: ...${factor.id.slice(-6)})`}</p>
                    <p className="text-xs text-muted-foreground">Status: {factor.status}</p>
                  </div>
                  <Button onClick={() => handleUnenroll(factor.id)} variant="destructive" size="sm" disabled={isLoading}>
                    {isUnenrolling ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!isLoading && factors.length === 0 && !factorsError && <p className="text-sm text-muted-foreground">No MFA methods are currently set up.</p>}
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
          <CardDescription>Update your login password. You will be logged out from other sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
            <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword}>
              {isUpdatingPassword ? <><Loader2 className="mr-2 size-4 animate-spin" /> Updating...</> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security Tips</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Keep your authenticator app secure and backed up.", "Do not share your password or MFA codes.", "Use a strong, unique password for admin access.", "Log out when you finish managing your site."].map((tip) => (
              <li key={tip} className="flex items-start"><CheckCircle className="mr-2 mt-1 size-3.5 shrink-0 text-primary" />{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}