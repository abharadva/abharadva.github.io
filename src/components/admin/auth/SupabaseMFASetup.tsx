
/*
This file is updated for the new neo-brutalist design.
- The minimalist layout is replaced with a bold, high-contrast aesthetic featuring hard shadows and thick borders.
- The step-by-step instructions are styled with a strong, blocky feel.
- The QR code and manual entry sections are presented in containers with pronounced borders and backgrounds.
- All soft UI elements (`rounded-lg`, subtle colors) are replaced with sharp corners (`rounded-none`) and a stark color palette.
- Components now use the 'Space Mono' font.
*/
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, Copy, Eye, EyeOff } from "lucide-react";
import { config } from "@/lib/config";

export default function SupabaseMFASetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [factorId, setFactorId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const protectPageAndEnroll = async () => {
      setIsLoadingState(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: config.mfa.issuer,
        friendlyName: `${session.user.email} (${config.mfa.appName})`,
      });

      if (enrollError) {
        let errorMessage =
          enrollError.message || "Failed to start MFA enrollment.";
        if (enrollError.message.includes("Enrolled factors exceed")) {
          errorMessage =
            "MFA is already set up. Try logging in or manage factors in your security settings.";
        }
        setError(errorMessage);
        setIsLoadingState(false);
        return;
      }

      if (data) {
        setQrCodeUrl(data.totp.qr_code);
        setManualEntryKey(data.totp.secret);
        setFactorId(data.id);
      }
      setIsLoadingState(false);
    };
    protectPageAndEnroll();
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingState(true);
    setError("");

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setIsLoadingState(false);
      setError(challengeError.message || "Failed to create MFA challenge.");
      return;
    }

    const challengeId = challengeData.id;
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otp,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      setOtp("");
      return;
    }

    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    router.replace("/admin/dashboard");
  };

  const copySecret = async (button: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
      const originalText = button.innerHTML;
      button.innerHTML = "Copied!";
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy secret:", err);
      setError("Failed to copy. Please copy manually.");
    }
  };

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (isLoadingState && !qrCodeUrl && !error) {
    return (
      <motion.div
        key="mfa-setup-loading"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <Loader2 className="size-8 animate-spin text-neutral-500" />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mfa-setup-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12 font-mono"
    >
      <div className="w-full max-w-lg space-y-8 rounded-none border-2 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-black bg-yellow-300">
            <Smartphone className="size-6 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-black">
            Set Up Two-Factor Authentication
          </h2>
          <p className="mt-2 text-neutral-600">
            Secure your admin account with an authenticator app.
          </p>
        </div>

        <AnimatePresence>
          {error && !factorId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="my-4 rounded-none border-2 border-destructive bg-red-100 p-3"
            >
              <p className="text-sm font-bold text-destructive">{error}</p>
              {error.includes("MFA is already set up") && (
                <Button
                  variant="link"
                  onClick={() => router.push("/admin/mfa-challenge")}
                  className="mt-1 h-auto p-0 text-sm"
                >
                  Go to MFA Challenge
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {factorId && (
          <div className="space-y-8">
            <div className="space-y-4 rounded-none border-2 border-black bg-neutral-50 p-4">
              <h3 className="text-lg font-bold text-black">
                <span className="mr-2 rounded-sm bg-yellow-300 px-2 py-1 text-black">1</span> Scan QR Code
              </h3>
              <p className="text-sm text-neutral-600">
                Open your authenticator app (e.g., Google Authenticator, Authy)
                and scan this QR code.
              </p>
              {qrCodeUrl ? (
                <div className="flex justify-center rounded-none border-2 border-black p-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for MFA setup"
                    className="size-48"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-none bg-neutral-200">
                  <Loader2 className="animate-spin text-neutral-500" />
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-none border-2 border-black bg-neutral-50 p-4">
              <h3 className="text-lg font-bold text-black">
                <span className="mr-2 rounded-sm bg-yellow-300 px-2 py-1 text-black">2</span> Manual Entry
              </h3>
              <p className="text-sm text-neutral-600">
                If you can't scan, enter this secret key into your app.
              </p>
              <div className="flex items-center gap-2 rounded-none border-2 border-black bg-white p-3">
                <code className="flex-1 break-all text-sm tracking-wider text-black">
                  {showSecret ? manualEntryKey.match(/.{1,4}/g)?.join(" ") : "•••• •••• •••• ••••"}
                </code>
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={(e) => copySecret(e.currentTarget)}>
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="rounded-none border-2 border-black bg-neutral-50 p-4">
                  <h3 className="text-lg font-bold text-black">
                    <span className="mr-2 rounded-sm bg-yellow-300 px-2 py-1 text-black">3</span> Verify Code
                  </h3>
                  <label htmlFor="totpCode" className="mt-2 block text-sm text-neutral-600">
                    Enter the 6-digit code from your app to complete setup.
                  </label>
                  <div className="mt-2">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                      <InputOTPGroup className="w-full justify-center">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <AnimatePresence>
                  {error && factorId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-none border-2 border-destructive bg-red-100 p-3"
                    >
                      <p className="text-sm font-bold text-destructive">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                  <Button type="submit" disabled={isLoadingState || otp.length !== 6} className="flex-1">
                    {isLoadingState ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Verify & Complete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/admin/login");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}