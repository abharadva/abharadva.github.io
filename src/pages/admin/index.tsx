

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { Loader2 } from "lucide-react";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStateAndRedirect = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        router.replace("/admin/login");
        return;
      }

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin/dashboard");
      } else if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
        router.replace("/admin/mfa-challenge");
      } else {
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
          router.replace("/admin/login");
          return;
        }

        const verifiedFactor = factorsData?.totp?.find((factor) => factor.status === "verified");
        if (!verifiedFactor) {
          router.replace("/admin/setup-mfa");
        } else {
          router.replace("/admin/mfa-challenge");
        }
      }
    };

    checkAuthStateAndRedirect();
  }, [router]);

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </Layout>
  );
}