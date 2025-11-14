"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      className="mb-12 rounded-none border-2 border-black bg-yellow-100 p-6  shadow-[6px_6px_0px_#000]"
    >
      <h2 className="mb-2 text-2xl font-black text-black">JOIN THE LIST</h2>
      <p className="mb-4 font-medium text-gray-800">
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
          variant="default"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "0.75rem" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-none border-2 p-2 text-sm font-bold
          ${status === "success" ? "border-green-600 bg-green-100 text-green-700" : ""}
          ${status === "error" ? "border-red-600 bg-red-100 text-red-700" : ""}`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  );
}