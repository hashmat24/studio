import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Status = 'Operational' | 'Degraded' | 'Offline';

const StatusIndicator = ({ service, status }: { service: string, status: Status }) => {
  const { t } = useTranslation();
  const statusInfo = {
    Operational: { icon: CheckCircle2, color: 'text-primary', text: t('operational') },
    Degraded: { icon: AlertCircle, color: 'text-accent', text: t('degraded') },
    Offline: { icon: XCircle, color: 'text-destructive', text: t('offline') },
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
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('systemMonitoring')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusIndicator service={t('weatherApi')} status="Operational" />
        <StatusIndicator service={t('satelliteImagery')} status="Degraded" />
        <StatusIndicator service={t('marketPriceApi')} status="Operational" />
        <StatusIndicator service={t('firebaseFirestore')} status="Operational" />
        <StatusIndicator service={t('aiAdvisoryEngine')} status="Offline" />
      </CardContent>
    </Card>
  );
}
