const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-8">
        <p className="text-center text-muted-foreground">
          © {new Date().getFullYear()} Ramtos. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
