"use client"

import { SidebarContent, Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar, } from "@/components/ui/sidebar"
import { Ham, LayoutDashboard, LogOut, Shirt, Trophy, Users, PartyPopper } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Deportes",
    url: "/dashboard/sports",
    icon: Trophy,
  },
  {
    title: "Gastronomia",
    url: "/dashboard/food",
    icon: Ham,
  },
  {
    title: "Indumentaria",
    url: "/dashboard/clothing",
    icon: Shirt,
  },
  {
    title: "Inquilinos",
    url: "/dashboard/tenants",
    icon: Users,
  },
  {
    title: "Eventos",
    url: "/dashboard/eventos",
    icon: PartyPopper,
  },
]


export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        toast.success("Sesión cerrada")
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-primary-foreground shadow-lg transition-all group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
            <Image src="/meca-logo.png" alt="La Meca Logo" width={30} height={30} className="object-contain" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold leading-none tracking-tight">La Meca CDA</span>
            <span className="truncate text-[10px] text-muted-foreground uppercase font-medium mt-1 tracking-wider opacity-70">Complejo Deportivo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-4 opacity-50" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2 px-2 pt-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="h-12 transition-all duration-200 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent" >
                    <Link href={item.url} className="flex items-center gap-3 px-3" onClick={handleLinkClick}>
                      <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "text-primary-foreground shadow-sm" : "bg-transparent text-muted-foreground"}`}>
                        <item.icon className="size-5" />
                      </div>
                      <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-400"}`}>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-4 opacity-50" />

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar Sesión"
              className="h-12 w-full transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center cursor-pointer"
            >
              <div className="flex items-center gap-3 px-3">
                <LogOut className="size-5 text-muted-foreground group-hover:text-destructive" />
                <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
