"use client";

import { Copy, Heart, Landmark, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied to clipboard`);
  });
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-ambient">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-mono text-sm font-medium">{value}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary"
        onClick={() => copyToClipboard(value, label)}
      >
        <Copy className="h-3.5 w-3.5" />
        <span className="sr-only">Copy {label}</span>
      </Button>
    </div>
  );
}

export function SupportDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-[#ffdcc2]" />
              Support Spring Up
            </DrawerTitle>
            <DrawerDescription>
              Your contribution helps provide digital literacy tools and
              resources to the youth at the Senior Correctional Centre.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-4">
            <div className="rounded-lg bg-secondary/60 p-4">
              <p className="mb-3 text-center text-sm font-semibold text-primary">
                Bank Transfer
              </p>
              <div className="space-y-2">
                <DetailRow
                  label="Bank"
                  value="CBG"
                  icon={Landmark}
                />
                <DetailRow
                  label="Account Name"
                  value="Phoebe France"
                  icon={Landmark}
                />
                <DetailRow
                  label="Account Number"
                  value="2401371600001"
                  icon={Landmark}
                />
              </div>
            </div>

            <div className="rounded-lg bg-accent/30 p-4">
              <p className="mb-3 text-center text-sm font-semibold text-accent-foreground">
                Cash / Mobile Money
              </p>
              <DetailRow
                label="Mobile Number"
                value="0205905240"
                icon={Phone}
              />
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
