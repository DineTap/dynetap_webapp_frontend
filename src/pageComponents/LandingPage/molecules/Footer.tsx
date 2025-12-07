import Image from "next/image";
import Icon from "~/assets/icon.png";

export const Footer = () => {
  return (
    <footer className="border-t border-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-navy/60">
        <p>© {new Date().getFullYear()} DyneTap. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          {/* legal links can be placed here if needed */}
        </nav>
      </div>
    </footer>
  );
};
