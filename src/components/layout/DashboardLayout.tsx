import AppSidebar from './AppSidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

const DashboardLayout = ({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: string;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:ml-56 flex flex-col min-h-screen">
        <Topbar breadcrumb={breadcrumb} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 page-enter">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
