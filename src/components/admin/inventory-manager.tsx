// src/components/admin/inventory-manager.tsx
"use client";
import React, { useState, useMemo } from "react";
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
  SheetClose,
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
  Loader2,
  Calendar,
  MoreHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter, isBefore, addMonths } from "date-fns";
import { InventoryItem } from "@/types";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetInventoryQuery,
  useDeleteInventoryItemMutation,
} from "@/store/api/adminApi";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  className?: string;
}> = ({ title, value, icon, subValue, className }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </CardContent>
  </Card>
);

export default function InventoryManager() {
  const confirm = useConfirm();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useGetInventoryQuery();
  const [deleteItem] = useDeleteInventoryItemMutation();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalPurchaseValue = items.reduce(
      (acc, i) => acc + i.purchase_price,
      0,
    );
    const totalCurrentValue = items.reduce(
      (acc, i) => acc + (i.current_value || i.purchase_price),
      0,
    );
    const depreciation = totalPurchaseValue - totalCurrentValue;
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
      toast.error("Failed to delete item");
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

  return (
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
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" /> Add Item
        </Button>
      </div>

      {/* Stats Grid - Automatically Responsive via CSS Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Value"
          value={`$${stats.totalCurrentValue.toLocaleString()}`}
          icon={<Box className="size-4 text-muted-foreground" />}
          subValue={`Original: $${stats.totalPurchaseValue.toLocaleString()}`}
        />
        <StatCard
          title="Total Depreciation"
          value={`-$${stats.depreciation.toLocaleString()}`}
          icon={<TrendingDown className="size-4 text-destructive" />}
          className="text-destructive"
        />
        <StatCard
          title="Items Count"
          value={stats.totalItems}
          icon={<Box className="size-4 text-muted-foreground" />}
        />
        <StatCard
          title="Warranty Alert"
          value={stats.expiringSoon}
          icon={<Calendar className="size-4 text-orange-500" />}
          className={stats.expiringSoon > 0 ? "text-orange-500" : ""}
          subValue="Expiring in 30 days"
        />
      </div>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* --- DESKTOP VIEW: TABLE --- */}
        <div className="hidden md:block rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
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
                  <TableRow
                    key={item.id}
                    className="group hover:bg-muted/30 cursor-pointer"
                    onClick={() => openEdit(item)}
                  >
                    <TableCell className="font-medium">
                      <div>{item.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/70">
                        {item.serial_number || "No S/N"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.purchase_date
                        ? format(new Date(item.purchase_date), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-semibold">
                        $
                        {(
                          item.current_value || item.purchase_price
                        ).toLocaleString()}
                      </div>
                      {(item.current_value || 0) < item.purchase_price && (
                        <div className="text-[10px] text-destructive flex items-center">
                          <TrendingDown className="size-3 mr-1" />
                          {Math.round(
                            ((item.purchase_price - (item.current_value || 0)) /
                              item.purchase_price) *
                              100,
                          )}
                          %
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
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

        {/* --- MOBILE VIEW: CARD LIST --- */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No items found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <div className="text-xs font-mono text-muted-foreground">
                        {item.serial_number || "No S/N"}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Edit2 className="mr-2 size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {item.category}
                    </Badge>
                    {item.purchase_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        {format(new Date(item.purchase_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between border-t pt-3 mt-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        Current Value
                      </p>
                      <div className="font-mono font-bold text-lg">
                        $
                        {(
                          item.current_value || item.purchase_price
                        ).toLocaleString()}
                      </div>
                    </div>
                    {(item.current_value || 0) < item.purchase_price && (
                      <div className="text-xs text-destructive flex items-center bg-destructive/10 px-2 py-1 rounded-full">
                        <TrendingDown className="size-3 mr-1" />
                        {Math.round(
                          ((item.purchase_price - (item.current_value || 0)) /
                            item.purchase_price) *
                            100,
                        )}
                        % Depr.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>
                {editingItem ? "Edit Item" : "Add New Item"}
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>
          <InventoryForm
            item={editingItem}
            onSuccess={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
