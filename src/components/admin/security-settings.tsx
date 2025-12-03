// src/components/admin/security-settings.tsx
"use client";
import type React from "react";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMfaFactorsQuery,
  useUnenrollMfaFactorMutation,
  useUpdateUserPasswordMutation,
} from "@/store/api/adminApi";
import { Separator } from "../ui/separator";

export default function SecuritySettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const {
    data: factors = [],
    isLoading: isLoadingFactors,
    error: factorsError,
  } = useGetMfaFactorsQuery();
  const [unenrollFactor, { isLoading: isUnenrolling }] =
    useUnenrollMfaFactorMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] =
    useUpdateUserPasswordMutation();

  const handleUnenroll = async (factorId: string) => {
    if (
      !confirm(
        "Are you sure? Removing your only 2FA method may lock you out until you set it up again upon next login.",
      )
    )
      return;
    try {
      await unenrollFactor(factorId).unwrap();
      toast.success("MFA method removed successfully.");
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== "aal2") {
        router.push("/admin/login");
      }
    } catch (err: any) {
      toast.error("Failed to unenroll MFA", { description: err.message });
    }
  };

  const mfaEnabled = factors.some((f) => f.status === "verified");

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      await updatePassword(newPassword).unwrap();
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
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
        <p className="text-muted-foreground">
          Manage your account security and two-factor authentication.
        </p>
      </div>

      {!!factorsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(factorsError as any).message || "Failed to load MFA status"}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {mfaEnabled ? (
              <ShieldCheck className="h-10 w-10 text-green-500" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-yellow-500" />
            )}
            <div>
              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
              <CardDescription>
                {mfaEnabled
                  ? "Your account is secured with an additional layer of verification."
                  : "Add an extra layer of security to your account."}
              </CardDescription>
            </div>
            <Badge
              variant={mfaEnabled ? "default" : "secondary"}
              className={mfaEnabled ? "bg-green-500/15 text-green-600" : ""}
            >
              {mfaEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!mfaEnabled && !isLoading && (
            <div className="text-center p-6 border bg-secondary/30 rounded-lg">
              <h3 className="font-semibold">2FA is not active</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Protect your account from unauthorized access.
              </p>
              <Button onClick={() => router.push("/admin/setup-mfa")}>
                <Smartphone className="mr-2 size-4" /> Enable 2FA Now
              </Button>
            </div>
          )}
          {mfaEnabled && factors.length > 0 && (
            <>
              <h4 className="text-sm font-semibold mb-2">
                Registered Authenticators
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factors.map((factor) => (
                    <TableRow key={factor.id}>
                      <TableCell className="font-medium">
                        {factor.friendly_name || `Authenticator`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            factor.status === "verified"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {factor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleUnenroll(factor.id)}
                          variant="destructive"
                          size="sm"
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
        {mfaEnabled && (
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/setup-mfa")}
              disabled={isLoading}
            >
              Add Another Method
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>
            Update your login password. You will be logged out from other
            sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {passwordError && (
              <p className="text-sm font-medium text-destructive">
                {passwordError}
              </p>
            )}
            <Button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Keep your authenticator app secure and backed up.",
              "Do not share your password or MFA codes.",
              "Use a strong, unique password for admin access.",
              "Log out when you finish managing your site.",
            ].map((tip) => (
              <li key={tip} className="flex items-start">
                <CheckCircle className="mr-2 mt-1 size-3.5 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
