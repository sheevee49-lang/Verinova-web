import Topbar from '@/components/Topbar';
import { ToastProvider } from '@/components/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="app-shell">
        <Topbar />
        <main className="main-content">{children}</main>
      </div>
    </ToastProvider>
  );
}
