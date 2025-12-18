import { Users, Clock, CheckCircle, Send, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  total: number;
  pending: number;
  completed: number;
  submitted: number;
}

const StatsCards = ({ total, pending, completed, submitted }: StatsCardsProps) => {
  const completionRate = total > 0 ? Math.round(((completed + submitted) / total) * 100) : 0;
  const submissionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;
  
  const stats = [
    {
      label: "Total Teachers",
      value: total,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
      trend: null,
      subtitle: "Registered clients",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10",
      trend: pending > 0 ? "warning" : "success",
      subtitle: "Awaiting completion",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
      trend: completionRate >= 50 ? "success" : "warning",
      subtitle: `${completionRate}% completion rate`,
    },
    {
      label: "Submitted",
      value: submitted,
      icon: Send,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10",
      trend: submissionRate >= 30 ? "success" : "neutral",
      subtitle: `${submissionRate}% submission rate`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'success' ? 'text-emerald-600' : 
                  stat.trend === 'warning' ? 'text-amber-600' : 'text-muted-foreground'
                }`}>
                  {stat.trend === 'success' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : stat.trend === 'warning' ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold font-display bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground/80">{stat.subtitle}</p>
            </div>
            
            {/* Progress bar for visual representation */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-700`}
                style={{ width: `${Math.min((stat.value / Math.max(total, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
