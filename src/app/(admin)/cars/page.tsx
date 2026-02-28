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
import { motion } from "framer-motion";
import type { Car } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

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
    try {
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
    } catch {
      setCars([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader title="Manage Cars" description={`${cars.length} car(s)`}>
        <Link href="/cars/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Car
          </Button>
        </Link>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")} className="mb-5">
        <TabsList className="bg-white/50 backdrop-blur-sm border border-white/40 p-1 rounded-xl">
          <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Active
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Archived
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white/50 backdrop-blur-sm border-white/50">
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
          <SelectTrigger className="w-full sm:w-40 bg-white/50 backdrop-blur-sm border-white/50">
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 mb-5 rounded-2xl glass-dark text-white"
        >
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            {tab === "active" ? (
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction("archive")} className="gap-1.5">
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction("restore")} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <CarIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">No cars found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "archived" ? "No archived cars" : "Add your first car to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selected.length === cars.length && cars.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {/* Car Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cars.map((car) => (
              <motion.div key={car.id} variants={item}>
                <Card
                  className={`overflow-hidden hover:shadow-glass-hover group ${
                    selected.includes(car.id) ? "ring-2 ring-primary shadow-glow-amber-sm" : ""
                  }`}
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-[16/10] bg-muted">
                      {car.image ? (
                        <img
                          src={`/uploads/cars/${car.image}`}
                          alt={car.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          <CarIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Checkbox
                        checked={selected.includes(car.id)}
                        onCheckedChange={() => toggleSelect(car.id)}
                        className="bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs bg-white/70 backdrop-blur-sm">
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
                      <span className="text-lg font-bold text-gradient-amber">
                        &euro; {car.default_price.toLocaleString()}
                      </span>
                      <Link href={`/cars/${car.id}/edit`}>
                        <Button size="sm" variant="outline" className="gap-1.5 h-8">
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
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
