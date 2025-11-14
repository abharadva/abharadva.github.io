

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    setMessage("");

    try {
      // Mock API call
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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="my-24 rounded-lg bg-blueprint-bg p-8"
    >
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-black text-foreground">Join The List</h2>
          <p className="mt-2 text-muted-foreground">
            Get project updates, tech articles, and insights delivered straight to your inbox. No spam, ever.
          </p>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="flex w-full items-stretch gap-2">
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
              className="h-11"
              size="icon"
              aria-label="Subscribe"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
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
        </div>
      </div>
    </motion.section>
  );
}
