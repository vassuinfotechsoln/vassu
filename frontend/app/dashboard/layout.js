import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Mobile Header */}
      <MobileHeader />

      <div className="flex relative">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72 min-h-screen relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgb(99 102 241 / 0.1) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 left-1/4 w-[500px] h-[500px] opacity-20"
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
