import SupabaseLogin from "@/components/admin/auth/SupabaseLogin";
import Layout from "@/components/layout";

export default function AdminLoginPage() {
  // Use a special prop to tell the Layout not to render the public header/footer
  return (
    <Layout isAdmin>
      <SupabaseLogin />
    </Layout>
  );
}
