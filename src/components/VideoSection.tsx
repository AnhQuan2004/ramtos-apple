import React from "react";

const VideoSection = () => {
  return (
    <section className="w-full py-24 bg-black/90 relative" id="video-section">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]"></div>
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            See It In <span className="text-primary">Action</span>
          </h2>
          
          <p className="text-xl text-muted-foreground text-center max-w-3xl mb-12">
            Watch how easy it is to authenticate and sign transactions using passkeys on the Aptos blockchain.
          </p>
          
          <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img src="https://media-gif.s3.ap-southeast-1.amazonaws.com/device-passkey.gif" alt="Ramtos Demo" className="absolute inset-0 w-full h-full object-contain" />
          </div>
          
          <div className="mt-16 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">1</span>
              </div>
              <div className="h-px w-16 bg-primary/30"></div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">2</span>
              </div>
              <div className="h-px w-16 bg-primary/30"></div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">3</span>
              </div>
            </div>
            
            <a 
              href="#" 
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Try It Yourself
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
