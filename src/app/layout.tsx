import "./globals.css";
import type { Metadata } from "next";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "La Meca CDA - Panel de Control",
  description: "Panel de Control de La Meca CDA",
};


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className='antialiased bg-background'>
        <DashboardProvider>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full h-svh overflow-hidden bg-muted/30">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
        </DashboardProvider>
      </body>
    </html>
  );
}



