export default function ContactPage() {
  return (
    <section className="pt-28 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-cream to-cream/50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy">Get in Touch</h1>
          <p className="mt-4 text-lg text-navy/70">Ready to transform your restaurant experience? We'd love to hear from you.</p>
        </div>
        <div className="flex justify-center">
          <div className="space-y-8 w-full max-w-md">
            <div className="bg-cream/40 rounded-2xl p-8 shadow-sm border border-brand-light">
              <h3 className="text-xl font-bold text-navy mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">📧</span>
                  </div>
                  <div>
                    <p className="font-medium text-navy">Email</p>
                    <a href="mailto:dynetapza@gmail.com" className="text-blue-600 font-bold text-lg hover:text-blue-800 hover:underline transition-colors">
                      dynetapza@gmail.com
                    </a>
                  </div>
                </div>
                {/* Placeholder for phone/address if needed */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">🔗</span>
                  </div>
                  <div>
                    <p className="font-medium text-navy">LinkedIn</p>
                    <a href="https://www.linkedin.com/company/dynetap" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-lg hover:text-blue-800 hover:underline transition-colors">
                      dynetap
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">📸</span>
                  </div>
                  <div>
                    <p className="font-medium text-navy">Instagram</p>
                    <a href="https://www.instagram.com/dynetap" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-lg hover:text-blue-800 hover:underline transition-colors">
                      dynetap
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


