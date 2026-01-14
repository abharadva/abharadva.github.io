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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  Barcode,
  Receipt,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter, addMonths, parseISO } from "date-fns";
import { InventoryItem } from "@/types";
import { cn, parseLocalDate } from "@/lib/utils";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { Badge } from "@/components/ui/badge";
import {
  useGetInventoryQuery,
  useDeleteInventoryItemMutation,
} from "@/store/api/adminApi";
import { useIsMobile } from "@/hooks/use-mobile";

// --- HELPERS ---

const getWarrantyStatus = (expiryDate?: string | null) => {
  if (!expiryDate) return { label: "No Warranty", color: "text-muted-foreground", bg: "bg-secondary", icon: X };
  const expiry = parseLocalDate(expiryDate);
  const now = new Date();
  const warningZone = addMonths(now, 1);

  if (isAfter(now, expiry)) {
    return { label: "Expired", color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle };
  }
  if (isAfter(warningZone, expiry)) {
    return { label: "Expiring Soon", color: "text-orange-500", bg: "bg-orange-500/10", icon: AlertCircle };
  }
  return { label: "Active", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
};

const StatCard = ({ title, value, icon: Icon, subValue, trend }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && (
        <p className={cn("text-xs mt-1 flex items-center gap-1", trend === 'down' ? "text-destructive" : "text-muted-foreground")}>
          {trend === 'down' && <TrendingDown className="size-3" />}
          {subValue}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function InventoryManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  
  // State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "value" | "name">("date");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // API
  const { data: items = [], isLoading } = useGetInventoryQuery();
  const [deleteItem] = useDeleteInventoryItemMutation();

  // --- DERIVED DATA ---

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category));
    return Array.from(cats).sort();
  }, [items]);

  const processedData = useMemo(() => {
    let filtered = items.filter((i) => {
      const matchesSearch = 
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
        i.notes?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "value") {
        return (b.current_value || 0) - (a.current_value || 0);
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // Date default
      return parseLocalDate(b.purchase_date).getTime() - parseLocalDate(a.purchase_date).getTime();
    });

    // Stats Calculation based on FILTERED views (Powerful feature!)
    const totalCount = filtered.length;
    const totalOriginalValue = filtered.reduce((acc, i) => acc + i.purchase_price, 0);
    const totalCurrentValue = filtered.reduce((acc, i) => acc + (i.current_value ?? i.purchase_price), 0);
    const totalDepreciation = totalOriginalValue - totalCurrentValue;

    return { filtered, totalCount, totalOriginalValue, totalCurrentValue, totalDepreciation };
  }, [items, search, categoryFilter, sortBy]);

  // --- ACTIONS ---

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Asset?",
      description: "This will permanently remove this item from your inventory.",
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

  // Mobile force grid view
  const currentView = isMobile ? "grid" : viewMode;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* 1. Header & Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Box className="size-8 text-primary" /> Inventory
            </h2>
            <p className="text-muted-foreground">
              Manage physical assets, licenses, and hardware.
            </p>
          </div>
          <Button onClick={openCreate} className="shadow-lg">
            <Plus className="mr-2 size-4" /> Add Asset
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Value"
            value={`$${processedData.totalCurrentValue.toLocaleString()}`}
            icon={Receipt}
            subValue={`Orig: $${processedData.totalOriginalValue.toLocaleString()}`}
          />
           <StatCard
            title="Items"
            value={processedData.totalCount}
            icon={Box}
          />
          <StatCard
            title="Depreciation"
            value={`-$${processedData.totalDepreciation.toLocaleString()}`}
            icon={TrendingDown}
            subValue={`${((processedData.totalDepreciation / processedData.totalOriginalValue) * 100 || 0).toFixed(1)}% Loss`}
            trend="down"
          />
           <StatCard
            title="Categories"
            value={categories.length}
            icon={Filter}
          />
        </div>
      </div>

      {/* 2. Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-2 rounded-lg border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="size-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  Purchase Date {sortBy === "date" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("value")}>
                  Value (High-Low) {sortBy === "value" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Name (A-Z) {sortBy === "name" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>

           {!isMobile && (
             <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} size="sm">
               <ToggleGroupItem value="table"><List className="size-4"/></ToggleGroupItem>
               <ToggleGroupItem value="grid"><LayoutGrid className="size-4"/></ToggleGroupItem>
             </ToggleGroup>
           )}
        </div>
      </div>

      {/* 3. Data Display */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin size-10 text-muted-foreground" />
        </div>
      ) : processedData.filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
          <Box className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No assets found matching your filters.</p>
        </div>
      ) : (
        <>
          {currentView === 'table' ? (
             <div className="rounded-lg border bg-card overflow-hidden">
               <Table>
                 <TableHeader className="bg-muted/40">
                   <TableRow>
                     <TableHead className="w-[40%]">Item Details</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Warranty</TableHead>
                     <TableHead className="text-right">Value</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {processedData.filtered.map(item => {
                      const warranty = getWarrantyStatus(item.warranty_expiry);
                      return (
                        <TableRow key={item.id} className="group hover:bg-muted/30">
                          <TableCell>
                             <div className="flex items-center gap-3">
                                <div className="size-10 rounded-md bg-secondary flex items-center justify-center shrink-0 border">
                                   {item.image_url ? (
                                     <img src={item.image_url} alt="" className="size-full object-cover rounded-md" />
                                   ) : (
                                     <Box className="size-5 text-muted-foreground" />
                                   )}
                                </div>
                                <div>
                                   <div className="font-semibold text-foreground">{item.name}</div>
                                   {item.serial_number && (
                                     <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                        <Barcode className="size-3" /> {item.serial_number}
                                     </div>
                                   )}
                                </div>
                             </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                             <div className={cn("flex items-center gap-1.5 text-xs font-medium", warranty.color)}>
                                <warranty.icon className="size-3.5" />
                                {warranty.label}
                             </div>
                             {item.purchase_date && (
                               <div className="text-[10px] text-muted-foreground mt-0.5">
                                 Bought: {format(parseLocalDate(item.purchase_date), "MMM yyyy")}
                               </div>
                             )}
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="font-mono font-bold">${item.current_value?.toLocaleString() ?? item.purchase_price.toLocaleString()}</div>
                             {item.current_value && item.current_value < item.purchase_price && (
                               <div className="text-[10px] text-destructive flex items-center justify-end">
                                  <TrendingDown className="size-3 mr-1" />
                                  {Math.round(((item.purchase_price - item.current_value) / item.purchase_price) * 100)}%
                               </div>
                             )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>
                                  <Edit2 className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                   })}
                 </TableBody>
               </Table>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {processedData.filtered.map(item => {
                  const warranty = getWarrantyStatus(item.warranty_expiry);
                  return (
                    <Card key={item.id} className="group hover:border-primary/50 transition-all hover:shadow-md">
                       <div className="aspect-video w-full bg-secondary/30 relative overflow-hidden border-b">
                          {item.image_url ? (
                             <img src={item.image_url} alt="" className="size-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                             <div className="flex items-center justify-center h-full text-muted-foreground/20">
                                <Box className="size-16" />
                             </div>
                          )}
                          <div className="absolute top-2 right-2">
                             <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-sm">{item.category}</Badge>
                          </div>
                       </div>
                       <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold truncate pr-2" title={item.name}>{item.name}</h3>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                             <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", warranty.bg, warranty.color)}>
                                {warranty.label}
                             </Badge>
                             {item.serial_number && (
                               <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px] bg-secondary px-1 rounded">
                                 SN: {item.serial_number}
                               </span>
                             )}
                          </div>

                          <div className="flex items-end justify-between border-t pt-3">
                             <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Value</p>
                                <p className="font-mono text-lg font-bold">${item.current_value?.toLocaleString() ?? item.purchase_price.toLocaleString()}</p>
                             </div>
                             {item.purchase_date && (
                                <div className="text-right">
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Purchased</p>
                                   <p className="text-xs">{format(parseLocalDate(item.purchase_date), "MMM yyyy")}</p>
                                </div>
                             )}
                          </div>
                       </CardContent>
                    </Card>
                  );
               })}
            </div>
          )}
        </>
      )}

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <SheetHeader>
              <SheetTitle>
                {editingItem ? "Edit Asset" : "New Asset"}
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="size-4" />
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