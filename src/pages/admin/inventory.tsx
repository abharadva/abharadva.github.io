"use client";
import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useGetInventoryQuery,
  useDeleteInventoryItemMutation,
} from "@/store/api/adminApi";
import InventoryForm from "@/components/admin/inventory/InventoryForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Box,
  TrendingDown,
  DollarSign,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter, isBefore, addMonths } from "date-fns";
import { InventoryItem } from "@/types";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";

export default function InventoryPage() {
  const confirm = useConfirm();

  const { isLoading: isAuthLoading } = useAuthGuard();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useGetInventoryQuery();
  const [deleteItem] = useDeleteInventoryItemMutation();

  // --- Stats Logic ---
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalPurchaseValue = items.reduce(
      (acc, i) => acc + i.purchase_price,
      0,
    );
    const totalCurrentValue = items.reduce(
      (acc, i) => acc + (i.current_value || 0),
      0,
    );
    const depreciation = totalPurchaseValue - totalCurrentValue;

    // Warranty check (expiring in 30 days)
    const today = new Date();
    const nextMonth = addMonths(today, 1);
    const expiringSoon = items.filter(
      (i) =>
        i.warranty_expiry &&
        isAfter(new Date(i.warranty_expiry), today) &&
        isBefore(new Date(i.warranty_expiry), nextMonth),
    ).length;

    return {
      totalItems,
      totalPurchaseValue,
      totalCurrentValue,
      depreciation,
      expiringSoon,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Inventory Item?",
      description: "This action cannot be undone.",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteItem(id).unwrap();
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  if (isAuthLoading)
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Box className="size-6 text-primary" /> Inventory
            </h2>
            <p className="text-muted-foreground">
              Track hardware, licenses, and assets.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Item
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalCurrentValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Original: ${stats.totalPurchaseValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Depreciation
              </CardTitle>
              <TrendingDown className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                -${stats.depreciation.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Items Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Warranty Alert
              </CardTitle>
              <Calendar className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.expiringSoon}
              </div>
              <p className="text-xs text-muted-foreground">
                Expiring in 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table Area */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Purchase Date
                  </TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium">
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {item.category}
                        </div>
                        {item.serial_number && (
                          <div className="text-[10px] font-mono text-muted-foreground/70">
                            {item.serial_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {item.purchase_date
                          ? format(new Date(item.purchase_date), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">
                          ${(item.current_value || 0).toLocaleString()}
                        </div>
                        {(item.current_value || 0) < item.purchase_price && (
                          <div className="text-[10px] text-destructive flex items-center">
                            <TrendingDown className="size-3 mr-1" />
                            {Math.round(
                              ((item.purchase_price -
                                (item.current_value || 0)) /
                                item.purchase_price) *
                                100,
                            )}
                            %
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(item)}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingItem ? "Edit Item" : "Add Inventory"}
              </SheetTitle>
            </SheetHeader>
            <InventoryForm
              item={editingItem}
              onSuccess={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
