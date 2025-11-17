import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, Session } from "@/supabase/client";

export function useAuthGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuthAndAAL = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !currentSession) {
        router.replace("/admin/login");
        return;
      }

      setSession(currentSession);

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError || aalData.currentLevel !== 'aal2') {
        // If AAL2 is not met, always redirect to login. 
        // The login page will correctly route to MFA challenge or setup if needed.
        router.replace("/admin/login");
        return;
      }
      
      // If we reach here, the user is fully authenticated.
      setIsLoading(false);
    };

    checkAuthAndAAL();
    
    // Listen for auth changes to handle logout from another tab
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
            router.replace('/admin/login');
        }
    });

    return () => {
        authListener?.subscription?.unsubscribe();
    };

  }, [router]);

  return { isLoading, session };
}