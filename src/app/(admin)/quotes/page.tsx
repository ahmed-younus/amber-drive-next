"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { QUOTE_STATUS_COLORS } from "@/lib/constants";

interface QuoteItem {
  id: number;
  quoteNumber: string;
  clientName: string;
  clientEmail: string | null;
  destination: string | null;
  totalAmount: string | null;
  status: string;
  createdAt: string;
  quoteCars: Array<{ car: { name: string; brand: string } }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function QuotesLogPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const fetchQuotes = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search });
    const res = await fetch(`/api/quotes?${params}`);
    const data = await res.json();
    setQuotes(data.quotes || []);
    setSelected([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [search]);

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} quote(s)?`)) return;
    const res = await fetch("/api/quotes/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    if ((await res.json()).success) {
      toast.success(`${selected.length} quote(s) deleted`);
      fetchQuotes();
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader title="Quotes" description={`${quotes.length} quote(s)`}>
        <Link href="/quotes/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Quote
          </Button>
        </Link>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by client, quote number, or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 mb-5 rounded-2xl glass-dark text-white"
        >
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-1.5 ml-auto">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">No quotes found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first quote</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {quotes.map((q) => (
            <motion.div key={q.id} variants={item}>
              <Card className={`hover:shadow-glass-hover transition-all duration-200 ${selected.includes(q.id) ? "ring-2 ring-primary shadow-glow-amber-sm" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={selected.includes(q.id)}
                    onCheckedChange={() => toggleSelect(q.id)}
                  />
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{q.clientName || "No Name"}</span>
                      <span className="text-xs text-muted-foreground">{q.quoteNumber}</span>
                      <Badge variant="secondary" className={QUOTE_STATUS_COLORS[q.status] || ""}>
                        {q.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                      <span>{q.quoteCars?.length || 0} car(s)</span>
                      {q.destination && <><span>&middot;</span><span>{q.destination}</span></>}
                      <span>&middot;</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {q.totalAmount && (
                      <span className="font-bold text-sm hidden sm:block tabular-nums text-gradient-amber">
                        &euro; {Number(q.totalAmount).toLocaleString()}
                      </span>
                    )}
                    <Link href={`/quotes/${q.id}/preview`}>
                      <Button size="sm" variant="outline" className="gap-1.5 h-9">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
