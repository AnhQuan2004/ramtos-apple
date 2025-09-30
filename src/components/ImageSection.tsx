import React from "react";

const ImageSection = () => {
  return (
    <section className="w-full h-screen relative overflow-hidden flex items-center justify-center" id="image-section">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-black/90"></div>
      
      {/* Full-screen GIF container */}
      <div className="relative w-full h-full">
        <img 
          src="/VERT 0928.gif" 
          alt="Aptos Passkey Authentication Animation" 
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  );
};

export default ImageSection;