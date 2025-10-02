import { Button } from "@/components/ui/button";
import { Book, Github } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl">
        <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-muted-foreground">
          Ready to get started?
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="default"
            className="flex items-center justify-center gap-2 bg-surface border border-card-border hover:bg-surface-hover h-12 sm:h-auto"
          >
            <Book className="h-4 w-4" />
            Documentation
          </Button>
          
          <Button
            variant="secondary"
            size="default"
            className="flex items-center justify-center gap-2 bg-surface border border-card-border hover:bg-surface-hover h-12 sm:h-auto"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;