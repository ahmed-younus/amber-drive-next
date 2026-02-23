"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CAR_CATEGORIES } from "@/lib/constants";
import { X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Car } from "@/types";

interface CarFormProps {
  car?: Car;
  mode: "add" | "edit";
}

export function CarForm({ car, mode }: CarFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    car?.image ? `/uploads/cars/${car.image}` : null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    if (imageFile) {
      formData.set("image", imageFile);
    } else {
      formData.delete("image");
    }

    try {
      const url = mode === "add" ? "/api/cars" : `/api/cars/${car?.id}`;
      const method = mode === "add" ? "POST" : "PUT";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        toast.success(mode === "add" ? "Car added successfully!" : "Car updated successfully!");
        router.push("/cars");
        router.refresh();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Failed to save car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image Upload */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <Label className="mb-3 block font-semibold text-sm">Car Image</Label>
            <div className="relative aspect-[4/3] bg-white/30 rounded-2xl overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/40 transition-all duration-300 group">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white rounded-xl p-1.5 hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer group-hover:bg-white/20 transition-colors">
                  <div className="h-14 w-14 rounded-2xl bg-white/50 flex items-center justify-center mb-3">
                    <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Click to upload
                  </span>
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    JPG, PNG, WEBP
                  </span>
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Form Fields */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Car Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={car?.name}
                  placeholder="e.g. Rolls-Royce Cullinan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={car?.brand}
                  placeholder="e.g. Rolls-Royce"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={car?.category || ""} required>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={car?.status || "active"}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_price">Price (&euro;)</Label>
                <Input
                  id="default_price"
                  name="default_price"
                  type="number"
                  step="100"
                  min="0"
                  defaultValue={car?.default_price || 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_km">Included KM</Label>
                <Input
                  id="default_km"
                  name="default_km"
                  type="number"
                  step="50"
                  min="0"
                  defaultValue={car?.default_km || 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_extra_km">Extra KM (&euro;)</Label>
                <Input
                  id="default_extra_km"
                  name="default_extra_km"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={car?.default_extra_km || 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_deposit">Deposit (&euro;)</Label>
                <Input
                  id="default_deposit"
                  name="default_deposit"
                  type="number"
                  step="500"
                  min="0"
                  defaultValue={car?.default_deposit || 0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={car?.description || ""}
                placeholder="Short description of the car..."
                rows={3}
                className="bg-white/50 backdrop-blur-sm border-white/50 focus:bg-white/80"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : mode === "add"
                  ? "Add Car"
                  : "Update Car"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.form>
  );
}
