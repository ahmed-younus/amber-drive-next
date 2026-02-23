"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  Trash2,
  RotateCcw,
  Car as CarIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Car } from "@/types";

export default function ManageCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: tab,
      search,
      brand: brandFilter,
      category: categoryFilter,
    });
    const res = await fetch(`/api/cars?${params}`);
    const data = await res.json();
    setCars(data.cars || []);
    setBrands(data.brands || []);
    setSelected([]);
    setLoading(false);
  }, [tab, search, brandFilter, categoryFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleBulkAction = async (action: "archive" | "restore" | "delete") => {
    if (selected.length === 0) return;

    if (action === "delete" && !confirm(`Delete ${selected.length} car(s) permanently?`)) return;

    const res = await fetch("/api/cars/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, action }),
    });

    if ((await res.json()).success) {
      toast.success(`${selected.length} car(s) ${action}d successfully`);
      fetchCars();
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === cars.length) {
      setSelected([]);
    } else {
      setSelected(cars.map((c) => c.id));
    }
  };

  return (
    <div>
      <PageHeader title="Manage Cars" description={`${cars.length} car(s)`}>
        <Link href="/cars/add">
          <Button className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            Add Car
          </Button>
        </Link>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")} className="mb-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Categories</SelectItem>
            {["Cabrio", "Coupe", "SUV", "Sedan", "Van"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-neutral-900 text-white">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            {tab === "active" ? (
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction("archive")} className="gap-1">
                <Archive className="h-3 w-3" /> Archive
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction("restore")} className="gap-1">
                <RotateCcw className="h-3 w-3" /> Restore
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")} className="gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No cars found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "archived" ? "No archived cars" : "Add your first car to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={selected.length === cars.length && cars.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {/* Car Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map((car) => (
              <Card
                key={car.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${
                  selected.includes(car.id) ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="relative">
                  <div className="aspect-[16/10] bg-muted">
                    {car.image ? (
                      <img
                        src={`/uploads/cars/${car.image}`}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        <CarIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selected.includes(car.id)}
                      onCheckedChange={() => toggleSelect(car.id)}
                      className="bg-white"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {car.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate">{car.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {car.brand}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary">
                      &euro; {car.default_price.toLocaleString()}
                    </span>
                    <Link href={`/cars/${car.id}/edit`}>
                      <Button size="sm" variant="outline" className="gap-1 h-8">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{car.default_km.toLocaleString()} km</span>
                    <span>&middot;</span>
                    <span>&euro;{car.default_extra_km}/km extra</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
