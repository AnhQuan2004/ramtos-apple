import { Database } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
              <Database className="h-4 w-4 text-background" />
            </div>
            <div className="w-5 h-5 bg-foreground rounded-lg opacity-80"></div>
            <div className="w-3 h-3 bg-foreground rounded-lg opacity-60"></div>
          </div>
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

        {/* Installation Command */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <button className="px-2 py-0.5 text-xs rounded-md bg-primary text-primary-foreground">
              npm
            </button>
            <button className="px-2 py-0.5 text-xs rounded-md text-muted-foreground hover:text-foreground">
              pnpm
            </button>
            <button className="px-2 py-0.5 text-xs rounded-md text-muted-foreground hover:text-foreground">
              bun
            </button>
            <span className="text-muted-foreground ml-2">{'>'}</span>
            <span className="text-code-keyword font-mono text-xs">npm</span>
            <span className="text-foreground font-mono text-xs">install ramtos</span>
          </div>
        </div>

        {/* Code Block */}
        <div className="code-block mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">1</span>
              <span className="text-code-keyword text-sm">import</span>
              <span className="text-code-text text-sm">{'{'}</span>
              <span className="text-code-text text-sm">Ramtos</span>
              <span className="text-code-text text-sm">{'}'}</span>
              <span className="text-code-keyword text-sm">from</span>
              <span className="text-code-string text-sm">'ramtos'</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">2</span>
              <span className="text-code-text text-sm">Ramtos.</span>
              <span className="text-code-keyword text-sm">create</span>
              <span className="text-code-text text-sm">()</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;