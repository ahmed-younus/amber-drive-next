"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CarForm } from "@/components/cars/car-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Car } from "@/types";

export default function EditCarPage() {
  const params = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cars/${params.id}`)
      .then((r) => r.json())
      .then(setCar)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Car" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div>
        <PageHeader title="Car Not Found" />
        <p className="text-muted-foreground">This car does not exist.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Car" description={car.name} />
      <CarForm car={car} mode="edit" />
    </div>
  );
}
