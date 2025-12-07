import Image from "next/image";
import { useServerTranslation } from "~/i18n";
import { Navbar } from "~/components/Navbar/Navbar";
import { Button } from "~/components/ui/button";
import { Poppins } from "next/font/google";
import heroImage from "~/assets/hero.png";
import showcase from "~/assets/showcase.png";
import showcaseMobile from "~/assets/showcaseMobile.png";
import Link from "next/link";
import { Footer } from "./molecules/Footer";
import { PricingSection } from "./molecules/PricingSection";
import restaurantImage from "~/assets/Restaurant.png";

const poppins = Poppins({
  weight: ["300", "400", "700"],
  subsets: ["latin-ext"],
});

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-cream to-cream/50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy">Order. Tap. Enjoy.</h1>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy">With DyneTap</h1>
          <p className="mt-4 text-lg text-navy/70">A sleek, QR-powered experience for browsing menus, placing orders, and paying—no waiting, no hassle.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex px-6 py-3 rounded-full bg-brand text-white hover:bg-brand-dark shadow-glow">Contact Us</Link>
            {/* <Link href="/demo" className="inline-flex px-6 py-3 rounded-full border border-brand-light text-navy hover:border-brand">Watch Demo Video</Link> */}
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-navy/70">
            <div className="flex -space-x-2">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-cream" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Customer 1"/>
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-cream" src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop" alt="Customer 2"/>
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-cream" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Customer 3"/>
            </div>
            <span>Trusted by modern eateries</span>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl bg-cream/30 shadow-2xl ring-1 ring-navy/10 overflow-hidden">
            <Image src={restaurantImage} alt="Restaurant" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block absolute -bottom-6 -left-6 w-40 h-40 bg-cream rounded-xl shadow-lg ring-1 ring-navy/10 p-4">
            <p className="text-sm font-semibold text-navy">Tap to pay</p>
            <p className="text-xs text-navy/60">• Apple Pay</p>
            <p className="text-xs text-navy/60">• Google Wallet</p>
            <p className="text-xs text-navy/60">• Cards</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { title: "QR menus", desc: "Scan, browse, and order — instantly.", icon: "📱" },
    { title: "Fast checkout", desc: "Split bills and pay in seconds.", icon: "⚡" },
    { title: "Smart upsells", desc: "Boost AOV with delightful suggestions.", icon: "🍰" },
    { title: "Real-time updates", desc: "Orders flow from table to kitchen.", icon: "📡" },
  ];
  return (
    <section id="features" className="py-16 sm:py-24 bg-cream/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy">Delightful features - Restaurant Customers & Staff</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="rounded-2xl border border-brand-light bg-cream/40 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-navy/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Scan", desc: "Customers scan a table QR code." },
    { title: "Order", desc: "Add items, customize, and send to kitchen." },
    { title: "Enjoy", desc: "Eat, relax, and reorder with one tap." },
    { title: "Pay", desc: "Split or pay the bill in seconds." },
  ];
  return (
        <section id="how" className="py-16 sm:py-24 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => (
            <div key={s.title} className="relative rounded-2xl bg-cream/40 p-6 shadow-sm border border-brand-light">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>
              <h3 className="font-semibold text-navy mt-2">{s.title}</h3>
              <p className="mt-1 text-sm text-navy/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const quotes = [
    { name: "Ava, Cafe Owner", text: "Checkouts are 3x faster and tips are up 20%." },
    { name: "Liam, Restaurant Manager", text: "Guests love scanning and reordering—no waving down staff." },
    { name: "Mia, Bar Manager", text: "Tabs are smoother and chargebacks dropped to near zero." },
  ];
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-cream/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy">Loved by modern restaurants</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {quotes.map(q => (
            <figure key={q.name} className="rounded-2xl bg-cream/40 p-6 shadow-sm border border-brand-light bg-cream">
              <blockquote className="text-navy/80">"{q.text}"</blockquote>
              <figcaption className="mt-3 text-sm text-navy/60">— {q.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta" className="py-16 sm:py-24 bg-gradient-to-tr from-brand-light to-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy">Ready to modernize your customer experience?</h2>
        <p className="mt-3 text-navy/70">Join DyneTap today and elevate your service with QR ordering and faster payments.</p>
        <p className="mt-3 text-navy/70">Please note - This is our early stage company website and the project is currently in its initial development phase. We are actively building and refining the platform while engaging with businesses for collaboration and future partnerships.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {/* <Link href="/demo" className="inline-flex px-6 py-3 rounded-full border border-brand-light text-navy hover:border-brand">Watch Demo Video</Link> */}
          <Link href="/contact" className="inline-flex px-6 py-3 rounded-full bg-brand text-white hover:bg-brand-dark shadow-glow">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}

export const LandingPage = async () => {
  const { t } = await useServerTranslation();

  return (
    <>
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </>
  );
};
