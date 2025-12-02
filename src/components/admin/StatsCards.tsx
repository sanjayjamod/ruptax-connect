import { Users, Clock, CheckCircle, Send } from "lucide-react";

interface StatsCardsProps {
  total: number;
  pending: number;
  completed: number;
  submitted: number;
}

const StatsCards = ({ total, pending, completed, submitted }: StatsCardsProps) => {
  const stats = [
    {
      label: "Total Clients",
      value: total,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Submitted",
      value: submitted,
      icon: Send,
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold font-display text-foreground">
                {stat.value}
              </p>
            </div>
            <div className={`rounded-full p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
