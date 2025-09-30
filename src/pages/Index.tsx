import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import DemoSection from "@/components/DemoSection";
import CallToAction from "@/components/CallToAction";
import ImageSection from "@/components/ImageSection";
import VideoSection from "@/components/VideoSection";
import { GridBackground } from "@/components/ui/grid-background-demo";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 1: Hero and Demo */}
      <section id="hero-section" className="min-h-screen">
        <GridBackground className="min-h-screen">
          <div>
            <Header />
            
            <main className="container mx-auto max-w-7xl">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-6">
                  <HeroSection />
                  <FeatureCards />
                  <CallToAction />
                </div>
                
                {/* Demo Sidebar */}
                <div className="lg:col-span-6 px-2 py-6 lg:px-6 lg:py-12">
                  <div className="lg:sticky top-8 space-y-6">
                    <DemoSection />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </GridBackground>
      </section>
      
      {/* Section 2: Image Section */}
      <ImageSection />
      
      {/* Section 3: Video Demo */}
      <VideoSection />
    </div>
  );
};

export default Index;
