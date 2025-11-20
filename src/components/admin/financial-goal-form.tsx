// src/components/admin/financial-goal-form.tsx
"use client";
import { FormEvent } from "react";
import type { FinancialGoal } from "@/types";
import { useSaveGoalMutation } from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required."),
  description: z.string().optional(),
  target_amount: z.coerce.number().positive("Target amount must be positive."),
  target_date: z.string().optional(),
});
type GoalFormValues = z.infer<typeof goalSchema>;

interface FinancialGoalFormProps {
  goal: Partial<FinancialGoal> | null;
  onSuccess: () => void;
}

export default function FinancialGoalForm({
  goal,
  onSuccess,
}: FinancialGoalFormProps) {
  const [saveGoal, { isLoading }] = useSaveGoalMutation();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      description: goal?.description || "",
      target_amount: goal?.target_amount || 0,
      target_date: goal?.target_date || "",
    },
  });

  const handleSubmit = async (values: GoalFormValues) => {
    try {
      await saveGoal({ ...values, id: goal?.id }).unwrap();
      toast.success(`Goal "${values.name}" saved successfully.`);
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to save goal", { description: err.message });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount *</FormLabel>
                <FormControl>
                  <Input type="number" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {goal?.id ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
