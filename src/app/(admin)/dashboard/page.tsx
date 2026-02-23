"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Car,
  FileText,
  Plus,
  Send,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { QUOTE_STATUS_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";

interface Stats {
  total_cars: number;
  active_cars: number;
  total_quotes: number;
  draft_quotes: number;
  sent_quotes: number;
  confirmed_quotes: number;
  recent_quotes: Array<{
    id: number;
    quoteNumber: string;
    clientName: string;
    status: string;
    totalAmount: string | null;
    createdAt: string;
    quoteCars: Array<{ car: { name: string } }>;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Active Cars",
      value: stats.active_cars,
      total: stats.total_cars,
      icon: Car,
      iconBg: "bg-violet-100 text-violet-600",
      accent: "border-l-violet-500",
      href: "/cars",
    },
    {
      label: "Total Quotes",
      value: stats.total_quotes,
      icon: FileText,
      iconBg: "bg-rose-100 text-rose-600",
      accent: "border-l-rose-500",
      href: "/quotes",
    },
    {
      label: "Sent Quotes",
      value: stats.sent_quotes,
      icon: Send,
      iconBg: "bg-blue-100 text-blue-600",
      accent: "border-l-blue-500",
      href: "/quotes",
    },
    {
      label: "Confirmed",
      value: stats.confirmed_quotes,
      icon: CheckCircle,
      iconBg: "bg-emerald-100 text-emerald-600",
      accent: "border-l-emerald-500",
      href: "/quotes",
    },
  ];

  const quickActions = [
    { href: "/quotes/create", icon: Plus, label: "Create Quote", iconColor: "text-amber-600" },
    { href: "/cars/add", icon: Car, label: "Add Car", iconColor: "text-violet-600" },
    { href: "/cars", icon: TrendingUp, label: "Manage Cars", iconColor: "text-blue-600" },
    { href: "/quotes", icon: FileText, label: "View Quotes", iconColor: "text-emerald-600" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item}>
        <PageHeader title="Dashboard" description="Welcome to Amber Drive Admin">
          <Link href="/quotes/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
        </PageHeader>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <Link href={card.href}>
              <Card className={`overflow-hidden hover:shadow-glass-hover cursor-pointer border-l-4 ${card.accent}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.label}
                      </p>
                      <p className="text-3xl font-bold mt-2 tabular-nums tracking-tight">
                        {card.value}
                      </p>
                      {card.total !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          of {card.total} total
                        </p>
                      )}
                    </div>
                    <div className={`h-11 w-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action) => (
          <Link key={action.href + action.label} href={action.href}>
            <Card className="hover:shadow-glass-hover cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center gap-2.5 text-center">
                <div className="h-10 w-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {action.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Recent Quotes */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Recent Quotes</h2>
              <Link href="/quotes">
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {stats.recent_quotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No quotes yet. Create your first quote!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recent_quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/60 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {quote.clientName || "No Name"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {quote.quoteNumber} &middot;{" "}
                          {quote.quoteCars?.length || 0} car(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {quote.totalAmount && (
                        <span className="text-sm font-semibold hidden sm:block tabular-nums">
                          &euro; {Number(quote.totalAmount).toLocaleString()}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className={
                          QUOTE_STATUS_COLORS[quote.status] || ""
                        }
                      >
                        {quote.status}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
