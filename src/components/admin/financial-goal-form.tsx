"use client";
import { useState, useEffect, FormEvent } from "react";
import type { FinancialGoal } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FinancialGoalFormProps {
  goal: Partial<FinancialGoal> | null;
  onSuccess: () => void;
}

export default function FinancialGoalForm({ goal, onSuccess }: FinancialGoalFormProps) {
  const [formData, setFormData] = useState({ name: "", description: "", target_amount: "", target_date: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || "",
        description: goal.description || "",
        target_amount: String(goal.target_amount || ""),
        target_date: goal.target_date || "",
      });
    }
  }, [goal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const dataToSave = { ...formData, target_amount: parseFloat(formData.target_amount), target_date: formData.target_date || null, description: formData.description || null, };
    
    const { error: dbError } = goal?.id
      ? await supabase.from("financial_goals").update(dataToSave).eq("id", goal.id)
      : await supabase.from("financial_goals").insert(dataToSave);

    if (dbError) setError(dbError.message);
    else onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div><Label htmlFor="name">Goal Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="target_amount">Target Amount *</Label><Input id="target_amount" name="target_amount" type="number" step="100" value={formData.target_amount} onChange={handleChange} required /></div>
            <div><Label htmlFor="target_date">Target Date</Label><Input id="target_date" name="target_date" type="date" value={formData.target_date} onChange={handleChange} /></div>
        </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end pt-4"><Button type="submit">{goal?.id ? "Save Changes" : "Create Goal"}</Button></div>
    </form>
  );
}