import SupabaseMFAChallenge from "@/components/admin/auth/SupabaseMFAChallenge";
import Layout from "@/components/layout";

export default function AdminMFAChallengePage() {
  return (
    <Layout isAdmin>
      <div className="">
        <SupabaseMFAChallenge />
      </div>
    </Layout>
  );
}
