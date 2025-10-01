import { Database } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Ramtos Logo" className="h-10 w-10" />
          <h1 className="text-xl font-bold">Ramtos</h1>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
          Sign in with superpowers. Buy, swap, subscribe, and much more. No passwords or extensions required.
        </h2>

        {/* Description */}
        <p className="text-base text-muted-foreground mb-6 leading-relaxed max-w-2xl">
          Ramtos imagines a world where passwords are a thing of the past, and where the web is built natively for payments.
        </p>


        {/* Code Block */}
        <div className="code-block mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">1</span>
              <span className="text-code-keyword text-sm">import</span>
              <span className="text-code-text text-sm">{'{'}</span>
              <span className="text-code-text text-sm">RamtosProvider</span>
              <span className="text-code-text text-sm">{'}'}</span>
              <span className="text-code-keyword text-sm">from</span>
              <span className="text-code-string text-sm">'@ramtos/wallet'</span>
              <span className="text-code-text text-sm">;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">2</span>
              <span className="text-code-keyword text-sm">export default function</span>
              <span className="text-code-text text-sm">App() {'{'}</span>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-keyword text-sm">return</span>
              <span className="text-code-text text-sm">(</span>
            </div>
            <div className="flex items-center gap-2 pl-16">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-text text-sm">&lt;RamtosProvider&gt;</span>
            </div>
            <div className="flex items-center gap-2 pl-24">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-text text-sm">&lt;YourApp /&gt;</span>
            </div>
            <div className="flex items-center gap-2 pl-16">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-text text-sm">&lt;/RamtosProvider&gt;</span>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-text text-sm">);</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground"></span>
              <span className="text-code-text text-sm">{'}'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
