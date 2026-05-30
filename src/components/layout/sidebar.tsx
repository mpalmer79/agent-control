import Link from "next/link";
import { Boxes } from "lucide-react";

import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { PRODUCT } from "@/lib/constants/product";
import { ROUTES } from "@/lib/constants/routes";

// Desktop sidebar with product mark and primary navigation.
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold">{PRODUCT.name}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav />
      </div>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">{PRODUCT.tagline}</p>
      </div>
    </aside>
  );
}
