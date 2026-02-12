import "./globals.css";
import type { Metadata } from "next";
import { DashboardProvider } from "@/context/DashboardContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "La Meca CDA - Panel de Control",
  description: "Panel de Control de La Meca CDA",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased bg-background">
        <DashboardProvider>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full h-svh overflow-hidden bg-muted/30">
              <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">La Meca CDA</span>
                </div>
              </header>
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
