"use client";

import Link from "next/link";
import { type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Icons } from "~/components/Icons";
import { Navbar } from "~/components/Navbar/Navbar";
import { Button } from "~/components/ui/button";
import { withPublicRoute } from "~/providers/AuthProvider/withPublicRoute";


const testAccounts = [
  { email: "random@gmail.com", password: "testPassword" },
  { email: "random2@gmail.com", password: "testPassword2" },
];

const Layout = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();

  return (
    <>
      <section className="min-h-screen bg-gradient-to-b from-cream to-cream/50 flex items-center justify-center py-16 sm:py-24">
        <div className="w-full flex justify-center items-center">
          {children}
        </div>
      </section>
    </>
  );
};

export default withPublicRoute(Layout);
