


"use client";
import { useState, useEffect, FormEvent } from "react";
import type { RecurringTransaction } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface RecurringTransactionFormProps {
  recurringTransaction: Partial<RecurringTransaction> | null;
  onSuccess: () => void;
}

export default function RecurringTransactionForm({ recurringTransaction, onSuccess }: RecurringTransactionFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "earning" | "expense",
    category: "",
    frequency: "monthly" as RecurringTransaction['frequency'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    occurrence_day: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (recurringTransaction) {
      setFormData({
        description: recurringTransaction.description || "",
        amount: String(recurringTransaction.amount || ""),
        type: recurringTransaction.type || "expense",
        category: recurringTransaction.category || "",
        frequency: recurringTransaction.frequency || "monthly",
        start_date: recurringTransaction.start_date || new Date().toISOString().split('T')[0],
        end_date: recurringTransaction.end_date || "",
        occurrence_day: String(recurringTransaction.occurrence_day || ""),
      });
    }
  }, [recurringTransaction]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const dataToSave = { 
      ...formData, 
      amount: parseFloat(formData.amount), 
      end_date: formData.end_date || null, 
      category: formData.category || null,
      occurrence_day: formData.occurrence_day ? parseInt(formData.occurrence_day) : null,
    };
    
    if (dataToSave.frequency === 'daily' || dataToSave.frequency === 'yearly') {
      dataToSave.occurrence_day = null;
    }

    const { error: dbError } = recurringTransaction?.id
      ? await supabase.from("recurring_transactions").update(dataToSave).eq("id", recurringTransaction.id)
      : await supabase.from("recurring_transactions").insert(dataToSave);

    if (dbError) setError(dbError.message);
    else onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div><Label htmlFor="description">Description *</Label><Input id="description" name="description" value={formData.description} onChange={handleChange} required /></div>
        <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="amount">Amount *</Label><Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required /></div>
            <div><Label htmlFor="category">Category</Label><Input id="category" name="category" value={formData.category} onChange={handleChange}/></div>
        </div>
        <div><Label>Type *</Label><RadioGroup name="type" value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})} className="flex items-center gap-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="expense" id="type-expense" /><Label htmlFor="type-expense">Expense</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="earning" id="type-earning" /><Label htmlFor="type-earning">Earning</Label></div></RadioGroup></div>
        
        <div className="grid grid-cols-2 gap-4 items-end">
            <div><Label htmlFor="frequency">Frequency *</Label><Select name="frequency" value={formData.frequency} onValueChange={(v: any) => setFormData({...formData, frequency: v, occurrence_day: ''})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="bi-weekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
            <AnimatePresence>
              {(formData.frequency === 'weekly' || formData.frequency === 'bi-weekly') && (
                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                  <Label htmlFor="occurrence_day">Day of Week</Label>
                  <Select name="occurrence_day" value={formData.occurrence_day} onValueChange={(v: any) => setFormData({...formData, occurrence_day: v})}><SelectTrigger><SelectValue placeholder="Select a day"/></SelectTrigger><SelectContent><SelectItem value="0">Sunday</SelectItem><SelectItem value="1">Monday</SelectItem><SelectItem value="2">Tuesday</SelectItem><SelectItem value="3">Wednesday</SelectItem><SelectItem value="4">Thursday</SelectItem><SelectItem value="5">Friday</SelectItem><SelectItem value="6">Saturday</SelectItem></SelectContent></Select>
                </motion.div>
              )}
              {formData.frequency === 'monthly' && (
                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                  <Label htmlFor="occurrence_day">Date of Month (1-31)</Label>
                  <Input id="occurrence_day" name="occurrence_day" type="number" min="1" max="31" value={formData.occurrence_day} onChange={handleChange} placeholder="e.g., 15"/>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="start_date">Start Date *</Label><Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} required /></div>
            <div><Label htmlFor="end_date">End Date (Optional)</Label><Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange}/></div>
        </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <div className="flex justify-end pt-4"><Button type="submit">{recurringTransaction?.id ? "Save Changes" : "Create Rule"}</Button></div>
    </form>
  );
}