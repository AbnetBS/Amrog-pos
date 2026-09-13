import Link from "next/link";

/**
 * Custom 404 page - Amrogn Chicken branding (charcoal + Amrogn red/yellow),
 * mobile-friendly. No internal/system details are exposed; just a friendly
 * "page not found" with clear routes back to the homepage and the customer menu.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF6] px-6 py-16">
      <div className="w-full max-w-md text-center">
        {/* Brand mark */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#1B1B20] border-2 border-[#F6C51B] flex items-center justify-center shadow-lg mb-6 overflow-hidden">
          <img src="/logo.png" alt="Amrogn Chicken" className="w-full h-full object-contain" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#D22630] mb-2">
          Amrogn Chicken
        </p>

        <h1 className="font-black text-5xl sm:text-6xl text-[#1B1B20]">404</h1>
        <h2 className="mt-3 text-xl font-bold text-[#36363E]">Page not found</h2>
        <p className="mt-3 text-sm text-[#57575F] leading-relaxed">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back to something crispy.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D22630] hover:bg-[#9F1B22] text-white font-bold text-sm px-6 py-3 transition-colors"
          >
            Back to Homepage
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F6C51B] hover:bg-[#D9A409] text-[#1B1B20] font-bold text-sm px-6 py-3 transition-colors"
          >
            View Our Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
