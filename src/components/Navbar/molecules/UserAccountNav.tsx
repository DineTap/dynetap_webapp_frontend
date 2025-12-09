"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { mockApi as api } from "~/lib/mockApi";

export function UserAccountNav() {
  const { data: user } = api.auth.getProfile.useQuery();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{t("userAccountNav.settings")}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.fullName && <p className="font-medium">{user?.fullName}</p>}
            {user?.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">{t("userAccountNav.dashboard")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            // Mock sign out
            localStorage.setItem("isLoggedIn", "false");
            window.location.href = "/";
          }}
        >
          {t("userAccountNav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
