import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
}

export function KpiCard({ title, value, description, icon: Icon, bgColor = "bg-primary/5", textColor = "text-primary/70", accentColor = "text-primary" }: KpiCardProps) {
    return (
        <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${bgColor}`}>
                <CardTitle className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{title}</CardTitle>
                <Icon className={`h-4 w-4 ${accentColor}`} />
            </CardHeader>
            <CardContent className="pt-4">
                <div className="text-xl font-bold">{value}</div>
                {description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{description}</p>}
            </CardContent>
        </Card>
    );
}
