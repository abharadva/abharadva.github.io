"use client";
import { useState, useEffect, FormEvent } from "react";
import type { Transaction } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TransactionFormProps {
  transaction: Transaction | null;
  onSuccess: () => void;
}

export default function TransactionForm({
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"earning" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date);
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setCategory(transaction.category || "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
    }
  }, [transaction]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !description || !amount) {
      setError("Please fill all required fields.");
      return;
    }

    const transactionData = {
      date,
      description,
      amount: parseFloat(amount),
      type,
      category: category.trim() || null,
    };

    const { error: dbError } = transaction
      ? await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transaction.id)
      : await supabase.from("transactions").insert(transactionData);

    if (dbError) setError(dbError.message);
    else onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        {/* --- NEW: Input with datalist for suggestions --- */}
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Work, Food, Bills"
          list="category-suggestions"
        />
      </div>
      <div>
        <Label>Type *</Label>
        <RadioGroup
          value={type}
          onValueChange={(v: "earning" | "expense") => setType(v)}
          className="flex items-center gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="type-expense" />
            <Label htmlFor="type-expense">Expense</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="earning" id="type-earning" />
            <Label htmlFor="type-earning">Earning</Label>
          </div>
        </RadioGroup>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end pt-4">
        <Button type="submit">
          {transaction ? "Save Changes" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
