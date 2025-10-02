import { Database } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <img src="/logo.png" alt="Ramtos Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
          <h1 className="text-lg sm:text-xl font-bold">Ramtos</h1>
        </div>

        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-4 sm:mb-6">
          Sign in with superpowers. Buy, swap, subscribe, and much more. No passwords or extensions required.
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl">
          Ramtos imagines a world where passwords are a thing of the past, and where the web is built natively for payments.
        </p>

        {/* Code Block - Enhanced for mobile */}
        <div className="code-block mb-6 sm:mb-8 overflow-x-auto">
          <div className="space-y-1 min-w-0">
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground flex-shrink-0">1</span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-keyword">import</span>
                <span className="text-code-text">{'{'}</span>
                <span className="text-code-text">RamtosProvider</span>
                <span className="text-code-text">{'}'}</span>
                <span className="text-code-keyword">from</span>
                <span className="text-code-string">'@ramtos/wallet'</span>
                <span className="text-code-text">;</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground flex-shrink-0">2</span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-keyword">export default function</span>
                <span className="text-code-text">App() {'{'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm pl-4 sm:pl-8">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-keyword">return</span>
                <span className="text-code-text">(</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm pl-8 sm:pl-16">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-text">&lt;RamtosProvider&gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm pl-12 sm:pl-24">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-text">&lt;YourApp /&gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm pl-8 sm:pl-16">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-text">&lt;/RamtosProvider&gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm pl-4 sm:pl-8">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-text">);</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground flex-shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                <span className="text-code-text">{'}'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
