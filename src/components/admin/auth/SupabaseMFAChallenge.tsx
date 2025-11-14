/*
This file is updated for the new neo-brutalist design system.
- All minimalist styles are replaced with the stark, high-contrast theme.
- The OTP input now uses the redesigned `InputOTP` component with sharp edges and a clear focus state.
- The countdown timer is styled to be bold and functional.
- The loading state uses a simple spinner within the redesigned `Button`.
- Replaced the previous `Button` with the neo-brutalist version from the UI kit.
*/
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KeyRound, Loader2 } from "lucide-react";

export default function SupabaseMFAChallenge() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [remainingTime, setRemainingTime] = useState(30);
  const [factorId, setFactorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const protectPageAndGetFactor = async () => {
      setIsLoadingState(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        setError("Could not check MFA status: " + aalError.message);
        setIsLoadingState(false);
        return;
      }

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
        return;
      }
      if (aalData?.currentLevel !== "aal1" || aalData?.nextLevel !== "aal2") {
        router.replace("/admin/login");
        return;
      }

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError || !factorsData?.totp?.length) {
        setError("Could not retrieve MFA factor. Please try logging in again.");
        setIsLoadingState(false);
        router.replace("/admin/login");
        return;
      }

      const firstVerifiedFactor = factorsData.totp.find((f) => f.status === "verified");
      if (firstVerifiedFactor) {
        setFactorId(firstVerifiedFactor.id);
      } else {
        setError("No verified MFA factor found. Please set up MFA or try logging in again.");
        router.replace("/admin/setup-mfa");
        return;
      }
      setIsLoadingState(false);
    };
    protectPageAndGetFactor();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(30 - (new Date().getSeconds() % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    if (!factorId) {
      setError("MFA factor ID is missing. Please try logging in again.");
      return;
    }
    setIsLoadingState(true);
    setError("");

    const codeToVerify = typeof e === 'string' ? e : otp;
    
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId,
      code: codeToVerify,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      setOtp("");
      return;
    }

    router.replace("/admin/dashboard");
  };

  const stepVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (isLoadingState && !error && !factorId) {
    return (
      <motion.div
        key="mfa-challenge-loading"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mfa-challenge-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.1 }}
      className="flex min-h-screen items-center justify-center bg-background px-4 font-sans"
    >
      <div className="w-full max-w-sm space-y-8 rounded-none border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#FFF]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none border-2 border-foreground bg-secondary">
            <KeyRound className="size-6 text-foreground" />
          </div>
          <h2 className="text-3xl font-black uppercase text-foreground">
            Two-Factor Auth
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter the code from your authenticator app.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div className="relative">
            <label htmlFor="totpCode" className="sr-only">
              Verification Code
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={handleVerify}
            >
              <InputOTPGroup className="w-full justify-center">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground"
              aria-hidden="true"
            >
              Code resets in{" "}
              <span className="font-sans font-bold text-foreground">
                {remainingTime}s
              </span>
            </div>
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

          <Button
            type="submit"
            disabled={isLoadingState || otp.length !== 6 || !factorId}
            className="w-full"
          >
            {isLoadingState ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={async () => {
                setIsLoadingState(true);
                await supabase.auth.signOut();
                router.replace("/admin/login");
              }}
            >
              Cancel and sign out
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}