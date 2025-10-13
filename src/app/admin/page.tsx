import SystemStatus from './components/system-status';
import UserManagement from './components/user-management';
import AiPerformance from './components/ai-performance';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
          Admin & Maintenance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor system health, manage users, and track AI performance.
        </p>
      </div>

      <div className="space-y-8">
        <SystemStatus />
        <AiPerformance />
        <UserManagement />
      </div>
    </div>
  );
}
