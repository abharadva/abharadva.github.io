// src/hooks/useAuthGuard.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuthAndAAL = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        if (router.pathname !== "/admin/login") {
          router.replace("/admin/login");
        } else {
          setIsLoading(false);
        }
        return;
      }

      setSession(currentSession);

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel !== 'aal2') {
        // Let login page handle redirection logic
        if (router.pathname !== "/admin/login" && router.pathname !== "/admin/mfa-challenge" && router.pathname !== "/admin/setup-mfa") {
          router.replace("/admin/login");
        } else {
          setIsLoading(false);
        }
        return;
      }

      // If we reach here, the user is fully authenticated.
      setIsLoading(false);
    };

    checkAuthAndAAL();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT' || !newSession) {
        router.replace('/admin/login');
      } else {
        // Re-check AAL on sign-in event
        checkAuthAndAAL();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };

  }, [router.pathname, router]);

  return { isLoading, session };
}