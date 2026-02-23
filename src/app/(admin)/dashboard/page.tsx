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
} from "lucide-react";
import { QUOTE_STATUS_COLORS } from "@/lib/constants";

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
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
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
      color: "from-violet-500 to-purple-600",
      href: "/cars",
    },
    {
      label: "Total Quotes",
      value: stats.total_quotes,
      icon: FileText,
      color: "from-pink-500 to-rose-600",
      href: "/quotes",
    },
    {
      label: "Sent Quotes",
      value: stats.sent_quotes,
      icon: Send,
      color: "from-blue-500 to-indigo-600",
      href: "/quotes",
    },
    {
      label: "Confirmed",
      value: stats.confirmed_quotes,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-600",
      href: "/quotes",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome to Amber Drive Admin">
        <Link href="/quotes/create">
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-0">
              <CardContent
                className={`p-5 bg-gradient-to-br ${card.color} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    {card.total !== undefined && (
                      <p className="text-xs text-white/70 mt-1">
                        of {card.total} total
                      </p>
                    )}
                  </div>
                  <card.icon className="h-10 w-10 text-white/30" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link href="/quotes/create">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Create Quote</span>
          </Button>
        </Link>
        <Link href="/cars/add">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Add Car</span>
          </Button>
        </Link>
        <Link href="/cars">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Manage Cars</span>
          </Button>
        </Link>
        <Link href="/quotes">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">View Quotes</span>
          </Button>
        </Link>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Quotes</h2>
            <Link href="/quotes">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {stats.recent_quotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No quotes yet. Create your first quote!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recent_quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {quote.clientName || "No Name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quote.quoteNumber} &middot;{" "}
                        {quote.quoteCars?.length || 0} car(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {quote.totalAmount && (
                      <span className="text-sm font-semibold hidden sm:block">
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
    </div>
  );
}
