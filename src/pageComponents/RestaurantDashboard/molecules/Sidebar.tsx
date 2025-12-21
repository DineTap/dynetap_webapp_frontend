"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Icons } from "~/components/Icons";
import { type NavItem } from "~/components/Navbar/molecules/MainNav";
import { TranslatedText } from "~/components/TranslatedText";
import { cn } from "~/utils/cn";

export type SidebarNavItem = NavItem & {
  icon?: keyof typeof Icons;
};

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: <TranslatedText id="userAccountNav.dashboard" />,
    href: "/dashboard",
    icon: "chevronLeft",
  },
  {
    title: <TranslatedText id="sidebar.restaurant" />,
    href: "/menu/manage/[slug]/restaurant",
    icon: "menu",
  },
  {
    title: <TranslatedText id="sidebar.menu" />,
    href: "/menu/manage/[slug]/menu",
    icon: "menuSquare",
  },
  {
    title: "QR Code",
    href: "/menu/manage/[slug]/qr-menu",
    icon: "qrcode",
  },
  {
    title: <TranslatedText id="sidebar.edit" />,
    href: "/menu/manage/[slug]/edit",
    icon: "edit",
  },
  {
    title: "Orders",
    href: "/menu/manage/[slug]/orders",
    icon: "listOrdered",
  },
  {
    title: "Analytics",
    href: "/menu/manage/[slug]/analytics",
    icon: "analytics",
  },
];

export function Sidebar() {
  const { slug } = useParams() as { slug: string };
  const pathname = usePathname();

  return (
    <nav className="flex h-full grow flex-row flex-wrap gap-2 md:flex-col">
      {sidebarNavItems.map((item) => {
        const Icon = Icons[item.icon || "menu"];
        const resolvedHref = item.href.includes("[slug]")
          ? item.href.replace("[slug]", slug)
          : item.href;
        const isActive = pathname === resolvedHref;

        return (
          <Link href={resolvedHref} key={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
