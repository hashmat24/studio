import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type Status = 'Operational' | 'Degraded' | 'Offline';

const StatusIndicator = ({ service, status }: { service: string, status: Status }) => {
  const statusInfo = {
    Operational: { icon: CheckCircle2, color: 'text-primary', text: 'Operational' },
    Degraded: { icon: AlertCircle, color: 'text-accent', text: 'Degraded Performance' },
    Offline: { icon: XCircle, color: 'text-destructive', text: 'Offline' },
  };

  const current = statusInfo[status];
  const Icon = current.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
      <p className="font-semibold">{service}</p>
      <div className={`flex items-center font-medium ${current.color}`}>
        <Icon className="h-5 w-5 mr-2" />
        <span>{current.text}</span>
      </div>
    </div>
  );
};

export default function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">System Monitoring & Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusIndicator service="Weather API (OpenWeatherMap)" status="Operational" />
        <StatusIndicator service="Satellite Imagery (ISRO Bhuvan)" status="Degraded" />
        <StatusIndicator service="Market Price API (Agmarknet)" status="Operational" />
        <StatusIndicator service="Firebase Firestore" status="Operational" />
        <StatusIndicator service="AI Advisory Engine" status="Offline" />
      </CardContent>
    </Card>
  );
}
