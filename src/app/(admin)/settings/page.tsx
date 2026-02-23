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

export default function SettingsPage() {
  const [backupLoading] = useState(false);

  const stats = [
    { label: "Platform", value: "Next.js 14", icon: Globe },
    { label: "Database", value: "MySQL (Prisma)", icon: Database },
    { label: "Auth", value: "NextAuth.js", icon: Shield },
    { label: "Email", value: "info@amberdrive.fr", icon: Mail },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="System overview and backup management"
      />

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-semibold text-sm">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Backup Section */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Backup & Restore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardContent className="p-5 text-center">
                <Database className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Database Backup</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Download SQL backup of all tables
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={backupLoading}
                  onClick={() => {
                    toast.info("Backup feature coming soon");
                  }}
                >
                  <Download className="h-4 w-4" /> Download SQL
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-5 text-center">
                <HardDrive className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Full Backup</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Download full ZIP with DB + uploads
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={backupLoading}
                  onClick={() => {
                    toast.info("Backup feature coming soon");
                  }}
                >
                  <Download className="h-4 w-4" /> Download ZIP
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-5 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Restore</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Restore from a backup file
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={backupLoading}
                  onClick={() => {
                    toast.info("Restore feature coming soon");
                  }}
                >
                  Upload & Restore
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
