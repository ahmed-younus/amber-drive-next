"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Sparkles,
  X,
  Car as CarIcon,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Car } from "@/types";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function CreateQuotePage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Client info
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [destination, setDestination] = useState("");

  // AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch("/api/cars?status=active")
      .then((r) => r.json())
      .then((data) => {
        setCars(data.cars || []);
        setBrands(data.brands || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCars = cars.filter((car) => {
    const matchSearch =
      !search ||
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || brandFilter === " " || car.brand === brandFilter;
    const matchCategory = !categoryFilter || categoryFilter === " " || car.category === categoryFilter;
    return matchSearch && matchBrand && matchCategory;
  });

  const toggleCar = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedCars = cars.filter((c) => selectedIds.includes(c.id));
  const totalPrice = selectedCars.reduce((sum, c) => sum + c.default_price, 0);

  const handleAISearch = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.car_ids?.length) {
        setSelectedIds(data.car_ids);
        toast.success(`AI selected ${data.car_ids.length} car(s)`);
      } else {
        toast.info("No matching cars found");
      }
    } catch {
      toast.error("AI search failed");
    }
    setAiLoading(false);
  };

  const handleCreate = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one car");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          destination,
          quote_date: new Date().toISOString().slice(0, 10),
          selected_cars: selectedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Quote created!");
        router.push(`/quotes/${data.quote.id}/preview`);
      } else {
        toast.error(data.error || "Failed to create quote");
      }
    } catch {
      toast.error("Failed to create quote");
    }
    setCreating(false);
  };

  return (
    <motion.div
      className="pb-28"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader title="Create Quote" description="Select cars and set client info" />

      {/* AI Search */}
      <Card className="mb-6 glass-dark border-0 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 -z-10" />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="font-semibold">AI Car Search</h3>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 2 luxury SUVs and 1 convertible for Monaco trip"
              className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 min-h-[44px] resize-none rounded-xl focus:bg-white/[0.1] focus:border-amber-500/30"
              rows={1}
            />
            <Button
              onClick={handleAISearch}
              disabled={aiLoading}
              className="bg-amber-500 hover:bg-amber-400 text-white shrink-0 shadow-lg shadow-amber-500/20"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["2 luxury SUVs", "1 convertible for summer", "Best Rolls-Royce options"].map(
              (q) => (
                <button
                  key={q}
                  onClick={() => setAiPrompt(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all duration-200"
                >
                  {q}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">Client Information (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Client Name</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="john@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Destination</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Monaco, France" />
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Car Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.03 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredCars.map((car) => {
            const isSelected = selectedIds.includes(car.id);
            return (
              <motion.div key={car.id} variants={cardVariants}>
                <Card
                  className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-glass-hover group ${
                    isSelected ? "ring-2 ring-primary shadow-glow-amber-sm" : ""
                  }`}
                  onClick={() => toggleCar(car.id)}
                >
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    {car.image ? (
                      <img
                        src={`/uploads/cars/${car.image}`}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-primary text-white rounded-full p-1 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <Badge className="absolute top-2.5 left-2.5 bg-white/70 backdrop-blur-sm text-foreground" variant="secondary">
                      {car.category}
                    </Badge>
                  </div>
                  <CardContent className="p-3.5">
                    <h4 className="font-semibold text-sm truncate">{car.name}</h4>
                    <p className="text-xs text-muted-foreground">{car.brand}</p>
                    <p className="text-sm font-bold text-gradient-amber mt-1">
                      &euro; {car.default_price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Fixed Bottom Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
          className="fixed bottom-0 left-0 right-0 glass-dark p-4 shadow-2xl z-50"
        >
          <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
              <Badge className="bg-primary text-white shrink-0">
                {selectedIds.length} car(s)
              </Badge>
              <div className="flex gap-1.5 overflow-x-auto">
                {selectedCars.slice(0, 5).map((c) => (
                  <Badge
                    key={c.id}
                    variant="secondary"
                    className="bg-white/10 text-white border-white/10 shrink-0 gap-1 pr-1"
                  >
                    {c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCar(c.id);
                      }}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedIds.length > 5 && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/10 shrink-0">
                    +{selectedIds.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-lg font-bold text-amber-400 tabular-nums">
                &euro; {totalPrice.toLocaleString()}
              </span>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 shadow-lg shadow-amber-500/20"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Quote"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
