
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { List, CheckCircle, AlertCircle } from "lucide-react";

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
    setIsLoading(true); setError(null); setSuccess(null);
    const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) { setError("Failed to load MFA factors: " + factorsError.message); setFactors([]); } 
    else { setFactors(data?.totp || []); }
    setIsLoading(false);
  };

  useEffect(() => { loadFactors(); }, []);

  const handleUnenroll = async (factorId: string) => {
    if (!confirm("Are you sure you want to remove this MFA method? You might be logged out or lose access if it's your only method.")) return;
    setIsLoading(true); setError(null); setSuccess(null);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollError) { setError("Failed to unenroll MFA: " + unenrollError.message); setIsLoading(false); } 
    else {
      setSuccess("MFA method removed successfully.");
      await loadFactors();
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") { router.push("/admin/login"); } 
      else { setIsLoading(false); }
    }
  };

  const mfaEnabled = factors.some((f) => f.status === "verified");

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters long."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setIsUpdatingPassword(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);
    if (updateError) { setPasswordError("Failed to update password: " + updateError.message); } 
    else { setPasswordSuccess("Password updated successfully!"); setNewPassword(""); setConfirmPassword(""); }
  };

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

      {success && <Alert className="border-green-500/50 text-green-400"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

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
                    {isLoading ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!isLoading && factors.length === 0 && !error && <p className="text-sm text-muted-foreground">No MFA methods are currently set up.</p>}
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
            {passwordSuccess && <p className="text-sm font-medium text-green-400">{passwordSuccess}</p>}
            <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
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