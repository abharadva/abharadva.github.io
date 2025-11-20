// src/components/admin/recurring-transaction-form.tsx
"use client";
import type { RecurringTransaction } from "@/types";
import { useSaveRecurringMutation } from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const recurringSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["expense", "earning"]),
  category: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly", "yearly"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  occurrence_day: z.coerce.number().optional(),
});
type RecurringFormValues = z.infer<typeof recurringSchema>;

interface RecurringTransactionFormProps {
  recurringTransaction: Partial<RecurringTransaction> | null;
  onSuccess: () => void;
}

export default function RecurringTransactionForm({ recurringTransaction, onSuccess }: RecurringTransactionFormProps) {
  const [saveRecurring, { isLoading }] = useSaveRecurringMutation();
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      description: recurringTransaction?.description || "",
      amount: recurringTransaction?.amount || 0,
      type: recurringTransaction?.type || "expense",
      category: recurringTransaction?.category || "",
      frequency: recurringTransaction?.frequency || "monthly",
      start_date: recurringTransaction?.start_date || new Date().toISOString().split('T')[0],
      end_date: recurringTransaction?.end_date || "",
      occurrence_day: recurringTransaction?.occurrence_day || undefined,
    }
  });

  const frequency = form.watch("frequency");

  const handleSubmit = async (values: RecurringFormValues) => {
    let dataToSave = { ...values, end_date: values.end_date || null, category: values.category || null, occurrence_day: values.occurrence_day || null };
    if (dataToSave.frequency === 'daily' || dataToSave.frequency === 'yearly') {
      dataToSave.occurrence_day = null;
    }
    
    try {
        await saveRecurring({ ...dataToSave, id: recurringTransaction?.id }).unwrap();
        toast.success(`Recurring rule "${values.description}" saved.`);
        onSuccess();
    } catch(err: any) {
        toast.error("Failed to save rule", { description: err.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Type *</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="expense" /></FormControl><FormLabel className="font-normal">Expense</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="earning" /></FormControl><FormLabel className="font-normal">Earning</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        
        <div className="grid grid-cols-2 gap-4 items-end">
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem><FormLabel>Frequency *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="bi-weekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
          <AnimatePresence>
            {(frequency === 'weekly' || frequency === 'bi-weekly') && (
              <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <FormField control={form.control} name="occurrence_day" render={({ field }) => (
                  <FormItem><FormLabel>Day of Week</FormLabel><Select onValueChange={v => field.onChange(parseInt(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select a day"/></SelectTrigger></FormControl><SelectContent><SelectItem value="0">Sunday</SelectItem><SelectItem value="1">Monday</SelectItem><SelectItem value="2">Tuesday</SelectItem><SelectItem value="3">Wednesday</SelectItem><SelectItem value="4">Thursday</SelectItem><SelectItem value="5">Friday</SelectItem><SelectItem value="6">Saturday</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </motion.div>
            )}
            {frequency === 'monthly' && (
              <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <FormField control={form.control} name="occurrence_day" render={({ field }) => (
                  <FormItem><FormLabel>Date of Month (1-31)</FormLabel><FormControl><Input type="number" min="1" max="31" placeholder="e.g., 15" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem><FormLabel>End Date (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex justify-end pt-4"><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}{recurringTransaction?.id ? "Save Changes" : "Create Rule"}</Button></div>
      </form>
    </Form>
  );
}