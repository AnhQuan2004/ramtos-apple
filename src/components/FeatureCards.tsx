import { Code, DollarSign, Settings, Zap } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Developer-first",
    description: "Integrate in just seconds. Works with wagmi and viem without code changes.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  {
    icon: DollarSign,
    title: "Flexible & low cost",
    description: "Best-in-class gas costs & latency. Pay fees in any supported currency.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Settings,
    title: "Simple & modular",
    description: "Use headlessly, or with UI. No extensions, API keys, passwords, or seed phrases needed.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10"
  },
  {
    icon: Zap,
    title: "Programmable",
    description: "Supports subscriptions & usage-based pricing for creators, streamers, agents, and more.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10"
  }
];

const FeatureCards = () => {
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-surface/80 border border-card-border rounded-xl p-4 sm:p-6 hover:bg-surface transition-all duration-200 hover:border-primary/20"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg ${feature.bgColor} flex-shrink-0`}>
                <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;