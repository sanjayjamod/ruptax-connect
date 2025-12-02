import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
}

const AuthCard = ({ title, subtitle, children, icon }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md animate-scale-in">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="mb-6 text-center">
          {icon && (
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-md">
              {icon}
            </div>
          )}
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
