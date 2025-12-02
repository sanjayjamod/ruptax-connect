import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-foreground">RupTax</h3>
            <p className="text-sm text-muted-foreground">
              Professional Income Tax Services. We help you with ITR filing, tax planning, and compliance.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+91 9924640689</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>ruptax@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>help@ruptax.online</span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Proprietor</h4>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Roopsiangbhai Jamod</strong>
              <br />
              Income Tax Consultant
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 RupTax. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Developed by{" "}
              <span className="font-semibold text-primary">
                Sanjaybhai Jamod (Smart Computer)
              </span>{" "}
              – 9574031243
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
