import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Mobile Header — only visible on < lg */}
      <MobileHeader />

      <div className="flex">
        {/* Sidebar — fixed on desktop, hidden on mobile (drawer via MobileHeader) */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72 min-h-screen relative overflow-x-hidden">
          {/* Background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute top-0 right-0 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgb(99 102 241 / 0.1) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 left-1/4 w-[200px] sm:w-[400px] lg:w-[500px] h-[200px] sm:h-[400px] lg:h-[500px] opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgb(139 92 246 / 0.1) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
