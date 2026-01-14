import Layout from "@/components/layout";
import React from "react";

export default function ComponentsPage() {
  return (
    <Layout>
      <div className="py-12 text-center">
        <h1 className="text-4xl font-bold">Component Showcase</h1>
        <p className="text-muted-foreground mt-2">
          This page has been deprecated and merged into `/ui`.
        </p>
        <p className="text-muted-foreground mt-2">
          Redirecting or remove this file.
        </p>
      </div>
    </Layout>
  );
}
