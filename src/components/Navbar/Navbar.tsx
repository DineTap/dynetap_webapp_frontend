"use client";

import React from "react";
import { UserAccountNav } from "./molecules/UserAccountNav";
import { MainNav, type NavItem } from "./molecules/MainNav";
import { cn } from "~/utils/cn";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { useUser } from "~/providers/AuthProvider/AuthProvider";
import { useTranslation } from "react-i18next";
import { TranslatedText } from "../TranslatedText";

const navbarItems: NavItem[] = [
	{
		title: <TranslatedText id="navbar.home"></TranslatedText>,
		href: "/",
	},
	{
		title: <TranslatedText id="navbar.dashboard"></TranslatedText>,
		href: "/dashboard",
	},
];

function Logo() {
	return (
		<Link href="/" className="inline-flex items-center gap-2">
			<span className="text-xl font-extrabold tracking-tight">
				<span className="text-navy">dyne</span>
				<span className="text-brand">Tap</span>
			</span>
		</Link>
	);
}

export const Navbar = () => {
	const { user } = useUser();
	const userLoggedIn = !!user;
	const { t } = useTranslation();

	return (
		<header className="bg-cream backdrop-blur border-b border-brand-light">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<Logo />
				<nav className="hidden md:flex items-center gap-6 text-sm text-navy/80">
					<Link href="/" className="hover:text-brand">
						{t("navbar.home")}
					</Link>
					{/* <Link href="/demo" className="hover:text-brand">Demo</Link> */}
					<Link href="/contact" className="hover:text-brand">
						Contact Us
					</Link>
					{userLoggedIn ? (
						<UserAccountNav />
					) : (
						<Link
							href="/login"
							className="hover:text-brand border border-brand-light px-2 py-1 rounded"
						>
							{t("navbar.login")}
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
};
