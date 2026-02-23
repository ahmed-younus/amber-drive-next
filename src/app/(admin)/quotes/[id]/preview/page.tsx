"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Smartphone,
  Mail,
  Check,
  Loader2,
  Download,
  Share2,
  Copy,
  Car as CarIcon,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ADMIN_EMAIL } from "@/lib/constants";

interface QuoteCar {
  id: number;
  carId: number;
  customPrice: string;
  customKm: number;
  customExtraKm: string;
  customDeposit: string;
  car: {
    id: number;
    name: string;
    brand: string;
    category: string;
    image: string;
    description: string | null;
  };
}

interface QuoteData {
  id: number;
  quoteNumber: string;
  clientName: string;
  clientEmail: string | null;
  quoteDate: string;
  destination: string | null;
  totalAmount: string | null;
  status: string;
  quoteCars: QuoteCar[];
}

export default function QuotePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [imgLoading, setImgLoading] = useState(false);
  const designRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Editable fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [carPricing, setCarPricing] = useState<
    Record<number, { price: number; km: number; extra_km: number; deposit: number }>
  >({});

  useEffect(() => {
    fetch(`/api/quotes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.quote) {
          setQuote(data.quote);
          setClientName(data.quote.clientName || "");
          setClientEmail(data.quote.clientEmail || "");
          setDestination(data.quote.destination || "");
          const pricing: typeof carPricing = {};
          data.quote.quoteCars.forEach((qc: QuoteCar) => {
            pricing[qc.car.id] = {
              price: Number(qc.customPrice),
              km: qc.customKm,
              extra_km: Number(qc.customExtraKm),
              deposit: Number(qc.customDeposit),
            };
          });
          setCarPricing(pricing);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const autoSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving("saving");
    saveTimeout.current = setTimeout(async () => {
      const cars = Object.entries(carPricing).map(([carId, p]) => ({
        car_id: Number(carId),
        custom_price: p.price,
        custom_km: p.km,
        custom_extra_km: p.extra_km,
        custom_deposit: p.deposit,
      }));

      await fetch(`/api/quotes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          destination,
          cars,
        }),
      });
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 2000);
    }, 800);
  }, [clientName, clientEmail, destination, carPricing, params.id]);

  const updatePricing = (carId: number, field: string, value: number) => {
    setCarPricing((prev) => ({
      ...prev,
      [carId]: { ...prev[carId], [field]: value },
    }));
  };

  useEffect(() => {
    if (!loading && quote) autoSave();
  }, [clientName, clientEmail, destination, carPricing]);

  const handleDelete = async () => {
    if (!confirm("Delete this quote permanently?")) return;
    await fetch(`/api/quotes/${params.id}`, { method: "DELETE" });
    toast.success("Quote deleted");
    router.push("/quotes");
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/quotes/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setQuote((prev) => prev ? { ...prev, status } : prev);
    toast.success(`Status updated to ${status}`);
  };

  const totalAmount = Object.values(carPricing).reduce((s, p) => s + p.price, 0);

  // Image generation
  const handleDownload = async () => {
    if (!designRef.current) return;
    setImgLoading(true);
    try {
      const { toPng } = await import("html-to-image");
      const el = designRef.current;
      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: el.scrollWidth,
        height: el.scrollHeight,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `amber-quote-${quote?.quoteNumber || "quote"}.png`;
      a.click();
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to generate image");
    }
    setImgLoading(false);
  };

  const handleShare = async () => {
    if (!designRef.current) return;
    setImgLoading(true);
    try {
      const { toBlob } = await import("html-to-image");
      const el = designRef.current;
      const blob = await toBlob(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: el.scrollWidth,
        height: el.scrollHeight,
        cacheBust: true,
      });
      if (blob) {
        const file = new File([blob], `amber-quote-${quote?.quoteNumber}.png`, {
          type: "image/png",
        });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Amber Drive Quote" });
          toast.success("Shared!");
        } else {
          toast.info("Share not supported, downloading instead");
          handleDownload();
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") toast.error("Share failed");
    }
    setImgLoading(false);
  };

  const copyEmail = () => {
    const el = document.getElementById("emailContent");
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("copy");
    selection?.removeAllRanges();
    toast.success("Email copied!");
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Quote Preview" />
        <Skeleton className="h-12 w-full mb-4 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div>
        <PageHeader title="Quote Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
              <CarIcon className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">This quote does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const designWidth = quote.quoteCars.length <= 2 ? 950 : 440 * 3 + 30 * 2 + 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader
        title="Quote Preview"
        description={`${quote.quoteNumber} ${clientName ? "• " + clientName : ""}`}
      >
        <div className="flex items-center gap-2">
          {saving === "saving" && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 gap-1.5 border-amber-200">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </Badge>
          )}
          {saving === "saved" && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 gap-1.5 border-emerald-200">
              <Check className="h-3 w-3" /> Saved
            </Badge>
          )}
          <Select value={quote.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32 h-9 bg-white/50 backdrop-blur-sm border-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["draft", "sent", "confirmed", "cancelled"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-1">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="edit">
        <TabsList className="mb-5 w-full sm:w-auto bg-white/50 backdrop-blur-sm border border-white/40 p-1 rounded-xl">
          <TabsTrigger value="edit" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Pencil className="h-3.5 w-3.5" /> Edit Pricing
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Smartphone className="h-3.5 w-3.5" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Mail className="h-3.5 w-3.5" /> Email
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: EDIT PRICING ===== */}
        <TabsContent value="edit">
          <Card className="mb-4 bg-amber-light/50 border-amber/20">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Client Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Client Name</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Destination</Label>
                  <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Cars - Edit Pricing</h3>
              <div className="space-y-4">
                {quote.quoteCars.map((qc) => {
                  const p = carPricing[qc.car.id] || { price: 0, km: 0, extra_km: 0, deposit: 0 };
                  return (
                    <div key={qc.car.id} className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
                        {qc.car.image ? (
                          <img
                            src={`/uploads/cars/${qc.car.image}`}
                            alt={qc.car.name}
                            className="w-20 h-14 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
                            <CarIcon className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm">{qc.car.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {qc.car.brand} &middot; {qc.car.category}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Price (&euro;)</Label>
                          <Input
                            type="number"
                            step="100"
                            value={p.price}
                            onChange={(e) => updatePricing(qc.car.id, "price", Number(e.target.value))}
                            className="text-center font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Included KM</Label>
                          <Input
                            type="number"
                            step="50"
                            value={p.km}
                            onChange={(e) => updatePricing(qc.car.id, "km", Number(e.target.value))}
                            className="text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Extra KM (&euro;)</Label>
                          <Input
                            type="number"
                            step="1"
                            value={p.extra_km}
                            onChange={(e) => updatePricing(qc.car.id, "extra_km", Number(e.target.value))}
                            className="text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Deposit (&euro;)</Label>
                          <Input
                            type="number"
                            step="500"
                            value={p.deposit}
                            onChange={(e) => updatePricing(qc.car.id, "deposit", Number(e.target.value))}
                            className="text-center"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="glass-dark p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-sm font-medium text-white/70">Total Amount</span>
            <span className="text-3xl font-bold text-amber-400 tabular-nums">
              &euro; {totalAmount.toLocaleString()}
            </span>
          </div>
        </TabsContent>

        {/* ===== TAB 2: WHATSAPP IMAGE ===== */}
        <TabsContent value="whatsapp">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">WhatsApp Image</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={handleShare} disabled={imgLoading} className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20">
                  {imgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                  Share
                </Button>
                <Button onClick={handleDownload} disabled={imgLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20">
                  {imgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </Button>
                <Button variant="outline" onClick={() => router.push("/quotes")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">Preview (scroll horizontally):</p>

              <div className="overflow-x-auto bg-white rounded-2xl p-2 shadow-inner">
                <div
                  ref={designRef}
                  style={{
                    width: designWidth,
                    minWidth: designWidth,
                    background: "#FFFFFF",
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "50px 20px",
                    gap: 50,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 60, width: 877 }}>
                    <div style={{ width: 877, height: 135, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={`${typeof window !== "undefined" ? window.location.origin : ""}/images/amberdrive-logo-black.svg`}
                        alt="AMBER"
                        style={{ width: 877, height: 135, objectFit: "contain" }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: 877 }}>
                      <div style={{ width: 877, fontWeight: 500, fontSize: 32, lineHeight: "38px", textAlign: "center", color: "#404040" }}>
                        Performance. Precision. Personal Service.
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                        {["All Experiences", "Business", "Escape", "Adrenaline"].map((t, i) => (
                          <div
                            key={t}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "12px 32px",
                              height: 53,
                              borderRadius: 18,
                              fontSize: 24,
                              fontWeight: i === 0 ? 600 : 500,
                              background: i === 0 ? "#191919" : "#EBEBEB",
                              color: i === 0 ? "#FFFFFF" : "#333333",
                            }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30 }}>
                    {quote.quoteCars.map((qc) => {
                      const p = carPricing[qc.car.id] || { price: 0, km: 0, extra_km: 0, deposit: 0 };
                      return (
                        <div
                          key={qc.car.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: "0 0 18px",
                            gap: 18,
                            width: 440,
                            background: "#FFFFFF",
                            border: "2px solid rgba(25,25,25,0.1)",
                            boxShadow: "-3.6px 5.4px 7.2px rgba(0,0,0,0.12)",
                            borderRadius: 22,
                          }}
                        >
                          <div style={{ width: 440, height: 340, borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
                            {qc.car.image ? (
                              <img
                                src={`${typeof window !== "undefined" ? window.location.origin : ""}/uploads/cars/${qc.car.image}`}
                                alt={qc.car.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#ccc" }}>
                                🚗
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 404, height: 146 }}>
                            <div style={{ fontWeight: 700, fontSize: 32, lineHeight: "38px", color: "#191919", overflow: "hidden", height: 76 }}>
                              {qc.car.name}
                            </div>
                            <div style={{ fontWeight: 400, fontSize: 24, lineHeight: "29px", color: "#616161", overflow: "hidden", height: 58 }}>
                              {qc.car.description || "Premium luxury vehicle for your exceptional journey."}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 404 }}>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 18px", width: 404, height: 83, background: "#C3A464", borderRadius: 40 }}>
                              <span style={{ fontWeight: 700, fontSize: 36, color: "#FFFFFF" }}>
                                € {p.price.toLocaleString()}
                              </span>
                            </div>
                            {[
                              `${p.km.toLocaleString()} km included total`,
                              `€${p.extra_km} / Extra km`,
                              `Deposit € ${p.deposit.toLocaleString()}`,
                            ].map((text) => (
                              <div
                                key={text}
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: 18,
                                  width: 404,
                                  height: 65,
                                  background: "#E6E6E6",
                                  borderRadius: 40,
                                }}
                              >
                                <span style={{ fontWeight: 500, fontSize: 24, color: "#191919" }}>
                                  {text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    {[
                      "Guaranteed model - colour subject to availability.",
                      "Delivery and collection included at your chosen address.",
                      "Additional kilometers can be purchased in advance at preferential rates.",
                    ].map((text) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, height: 42 }}>
                        <span style={{ fontWeight: 500, fontSize: 24, color: "rgba(97,97,97,0.8)" }}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 32, textAlign: "center", color: "#191919" }}>
                    Reserve now for guaranteed model allocation.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: EMAIL ===== */}
        <TabsContent value="email">
          <Card>
            <CardContent className="p-5">
              <div className="bg-amber-light/50 border border-amber/20 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold mb-2">How to use:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Click &quot;Copy Formatted Email&quot; below</li>
                  <li>Open Gmail, Outlook, etc.</li>
                  <li>Paste (Ctrl+V) into the email body</li>
                  <li>Add recipient and send!</li>
                </ol>
                <Button onClick={copyEmail} className="gap-2 mt-3">
                  <Copy className="h-4 w-4" /> Copy Formatted Email
                </Button>
              </div>

              <h3 className="font-semibold mb-3">Preview:</h3>
              <div
                id="emailContent"
                className="border border-white/40 rounded-2xl p-6 bg-white shadow-inner"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <p style={{ margin: "0 0 1em 0" }}>
                  Dear {clientName || "Valued Client"},
                </p>
                <p style={{ margin: "0 0 1em 0" }}>
                  Thank you for considering us for your travel arrangements – it is a pleasure to assist you.
                </p>

                {quote.quoteCars.length === 1 ? (
                  <>
                    <p style={{ margin: "0 0 1em 0" }}>
                      I&apos;m delighted to present our{" "}
                      <strong>{quote.quoteCars[0].car.name}</strong> as the perfect complement to your journey
                      {destination ? ` in ${destination}` : ""}.
                    </p>
                    <p style={{ margin: "0 0 1em 0" }}>Below is a summary of the key details:</p>
                    <h2 style={{ fontSize: 24, fontWeight: "bold", margin: "20px 0 15px" }}>
                      {quote.quoteCars[0].car.name}
                    </h2>
                    <table style={{ width: "100%", maxWidth: 600, borderCollapse: "collapse", margin: "20px 0" }}>
                      <tbody>
                        {(() => {
                          const p = carPricing[quote.quoteCars[0].car.id] || { price: 0, km: 0, extra_km: 0, deposit: 0 };
                          return [
                            ["Rental Price", `${p.price.toLocaleString()} EUR`],
                            ["Included km", `${p.km.toLocaleString()} km`],
                            ["Extra km Price", `${p.extra_km} EUR/km`],
                            ["Refundable Security Deposit", `${p.deposit.toLocaleString()} EUR`],
                          ].map(([label, val]) => (
                            <tr key={label}>
                              <td style={{ padding: 12, border: "1px solid #ddd", background: "#f8f8f8", fontWeight: 600, width: "50%" }}>
                                {label}
                              </td>
                              <td style={{ padding: 12, border: "1px solid #ddd", width: "50%" }}>
                                {label === "Rental Price" ? <strong>{val}</strong> : val}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <p style={{ margin: "0 0 1em 0" }}>
                      I&apos;m delighted to present the following options for your upcoming journey
                      {destination ? ` in ${destination}` : ""}.
                    </p>
                    <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
                      <thead>
                        <tr style={{ background: "#f8f8f8" }}>
                          {["Car", "Price", "Included KM", "Extra KM", "Deposit"].map((h) => (
                            <th key={h} style={{ padding: 12, textAlign: "left", border: "1px solid #ddd", fontWeight: 600 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quote.quoteCars.map((qc) => {
                          const p = carPricing[qc.car.id] || { price: 0, km: 0, extra_km: 0, deposit: 0 };
                          return (
                            <tr key={qc.car.id}>
                              <td style={{ padding: 12, border: "1px solid #ddd" }}>
                                <strong>{qc.car.name}</strong><br />
                                <span style={{ color: "#666", fontSize: 13 }}>{qc.car.brand}</span>
                              </td>
                              <td style={{ padding: 12, border: "1px solid #ddd" }}>
                                <strong>&euro;{p.price.toLocaleString()}</strong>
                              </td>
                              <td style={{ padding: 12, border: "1px solid #ddd" }}>{p.km.toLocaleString()} km</td>
                              <td style={{ padding: 12, border: "1px solid #ddd" }}>&euro;{p.extra_km}/km</td>
                              <td style={{ padding: 12, border: "1px solid #ddd" }}>&euro;{p.deposit.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}

                <p style={{ margin: "0 0 1em 0" }}>
                  You may also purchase additional kilometres in advance at preferential rates.
                </p>
                <p style={{ margin: "0 0 1em 0" }}>
                  Please let me know if you wish to confirm this booking or discuss any bespoke requirements
                  – I remain at your disposal to craft an exceptional travel experience for you.
                </p>
                <div style={{ marginTop: 30, paddingTop: 20, borderTop: "2px solid #C3A464" }} />
                <p style={{ margin: 0 }}>
                  <strong>Sincerely,<br />James Cody</strong><br />Director
                </p>
                <p style={{ margin: "15px 0 5px", fontSize: 18, letterSpacing: 2, fontWeight: "bold" }}>
                  AMBER DRIVE
                </p>
                <p style={{ margin: "5px 0", color: "#666", fontSize: 13 }}>
                  Performance. Precision. Personal Service.
                </p>
                <p style={{ margin: "5px 0", color: "#666", fontSize: 13 }}>
                  Email: {ADMIN_EMAIL}<br />
                  Website: https://amberdrive.fr
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
