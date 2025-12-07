import Image from "next/image";
import Link from "next/link";
import restaurantImage from "~/assets/hero.png";

export default function DemoPage() {
  return (
    <section className="pt-28 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-cream to-cream/50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy">See DyneTap in Action</h1>
          <p className="mt-4 text-lg text-navy/70">This represents an early-phase prototype of the customer experience. The design will continue to evolve and be refined through future development stages.</p>
          <p className="mt-4 text-lg text-navy/70">The restaurant interface is not yet included and will be introduced in subsequent iterations.</p>
        </div>
        <div className="bg-cream/40 rounded-2xl p-8 shadow-sm border border-brand-light">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
            <video 
              controls 
              className="w-full h-full object-contain"
              poster={restaurantImage.src}
            >
              <source src="/Demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold text-navy mb-4">Ready to get started?</h3>
            <p className="text-navy/70 mb-6">Experience the same seamless ordering process at your restaurant.</p>
            <Link href="/contact" className="inline-flex px-6 py-3 rounded-full bg-brand text-white hover:bg-brand-dark shadow-glow transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
