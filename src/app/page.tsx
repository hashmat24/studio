import DashboardHeader from '@/app/components/dashboard-header';
import HealthDashboard from '@/app/components/health-dashboard';
import RealTimeAdvisory from '@/app/components/real-time-advisory';
import PhotoAnalysis from '@/app/components/photo-analysis';
import MarketPrices from '@/app/components/market-prices';

export default function Home() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthDashboard />
          <RealTimeAdvisory />
        </div>
        <div className="space-y-6">
          <PhotoAnalysis />
          <MarketPrices />
        </div>
      </div>
    </div>
  );
}
