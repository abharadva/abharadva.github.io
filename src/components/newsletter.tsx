
"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setMessage("Thanks for subscribing! Please check your inbox to confirm.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An error occurred. Please try again later.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mb-12 rounded-none border-2 border-black bg-white p-6 shadow-[8px_8px_0_#000]"
    >
      <h2 className="mb-2 text-2xl font-bold text-black">Join The List</h2>
      <p className="mb-4 text-neutral-600">
        Project updates, cool links, and maybe some bad jokes. Straight to your
        inbox. No spam, ever.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="h-11 flex-1 text-base"
          required
          disabled={status === "loading"}
          aria-label="Email for newsletter"
        />
        <Button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="h-11 px-6 text-base"
        >
          {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant={status === "error" ? "destructive" : "default"}>
              {status === 'success' && <CheckCircle className="h-4 w-4" />}
              {status === 'error' && <XCircle className="h-4 w-4" />}
              <AlertTitle>{status === 'success' ? 'Success!' : 'Oops!'}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}