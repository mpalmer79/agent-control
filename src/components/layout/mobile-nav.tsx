"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, Menu } from "lucide-react";

import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRODUCT } from "@/lib/constants/product";
import { ROUTES } from "@/lib/constants/routes";

// Mobile navigation trigger and slide-out sheet.
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Link
              href={ROUTES.dashboard}
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Boxes className="h-5 w-5 text-primary" aria-hidden="true" />
              {PRODUCT.name}
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
