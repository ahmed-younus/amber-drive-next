"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Download,
  HardDrive,
  Shield,
  Globe,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

export default function SettingsPage() {
  const [backupLoading] = useState(false);

  const stats = [
    { label: "Platform", value: "Next.js 14", icon: Globe, iconBg: "bg-blue-100 text-blue-600" },
    { label: "Database", value: "MySQL (Prisma)", icon: Database, iconBg: "bg-emerald-100 text-emerald-600" },
    { label: "Auth", value: "NextAuth.js", icon: Shield, iconBg: "bg-violet-100 text-violet-600" },
    { label: "Email", value: "info@amberdrive.fr", icon: Mail, iconBg: "bg-amber-100 text-amber-600" },
  ];

  const backupCards = [
    {
      icon: Database,
      title: "Database Backup",
      description: "Download SQL backup of all tables",
      buttonLabel: "Download SQL",
      buttonIcon: Download,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: HardDrive,
      title: "Full Backup",
      description: "Download full ZIP with DB + uploads",
      buttonLabel: "Download ZIP",
      buttonIcon: Download,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: Shield,
      title: "Restore",
      description: "Restore from a backup file",
      buttonLabel: "Upload & Restore",
      iconBg: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item}>
        <PageHeader
          title="Settings"
          description="System overview and backup management"
        />
      </motion.div>

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="hover:shadow-glass-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold text-sm">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Backup Section */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-5">Backup & Restore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {backupCards.map((card) => (
                <Card key={card.title} className="hover:shadow-glass-hover">
                  <CardContent className="p-6 text-center">
                    <div className={`h-14 w-14 rounded-2xl ${card.iconBg} flex items-center justify-center mx-auto mb-4`}>
                      <card.icon className="h-7 w-7" />
                    </div>
                    <h4 className="font-semibold mb-1">{card.title}</h4>
                    <p className="text-xs text-muted-foreground mb-5">
                      {card.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      disabled={backupLoading}
                      onClick={() => {
                        toast.info("Backup feature coming soon");
                      }}
                    >
                      {card.buttonIcon && <card.buttonIcon className="h-4 w-4" />}
                      {card.buttonLabel}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
