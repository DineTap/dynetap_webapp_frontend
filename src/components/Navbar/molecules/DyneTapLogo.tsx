import Image from "next/image";
import Icon from "~/assets/icon.png";
import Link from "next/link";

export const DyneTapLogo = () => {
  return (
    <Link href="/dashboard">
      <span className="text-xl font-semibold">DyneTap</span>
    </Link>
  );
};
