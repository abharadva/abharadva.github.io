// src/hooks/useAuthGuard.ts (Improved Logic)
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel !== "aal2") {
        // If not fully authenticated, always send to login.
        // The login page will then route to the correct challenge or setup.
        router.replace("/admin/login");
        return;
      }

      // If we reach here, the user is authenticated.
      setSession(currentSession);
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/admin/login");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  return { isLoading, session };
}
