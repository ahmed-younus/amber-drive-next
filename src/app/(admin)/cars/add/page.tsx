import { PageHeader } from "@/components/layout/page-header";
import { CarForm } from "@/components/cars/car-form";

export default function AddCarPage() {
  return (
    <div>
      <PageHeader
        title="Add New Car"
        description="Add a new vehicle to the inventory"
      />
      <CarForm mode="add" />
    </div>
  );
}
