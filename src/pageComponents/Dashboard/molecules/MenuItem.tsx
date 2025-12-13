import { MenuOperations } from "./MenuOperations";
import Link from "next/link";
import { type Menus } from "~/lib/types";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface MenuItemProps {
  menu: Menus;
}

export function MenuItem({ menu }: MenuItemProps) {
  return (
    <div className="flex w-full flex-row justify-between items-center p-4">
      <div className="flex flex-row gap-4 flex-1">
        <div className="relative aspect-[2/1] h-full">
          {menu.logoImageUrl && (
            <Image
              src={menu.logoImageUrl}
              fill
              alt="Background image"
              className="rounded-sm object-cover"
            />
          )}
        </div>
        <Link href={`/menu/manage/${menu.slug}/restaurant`}>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col whitespace-nowrap">
              <p className="whitespace-nowrap font-semibold">{menu.name}</p>
              <p>{menu.address}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex gap-2 items-center">
        <Link href={`/menu/manage/${menu.slug}/orders`}>
          <Button variant="outline" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Orders
          </Button>
        </Link>
        <MenuOperations menuId={menu.id} />
      </div>
    </div>
  );
}
