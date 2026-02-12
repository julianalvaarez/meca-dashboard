"use client"

import { SidebarContent, Sidebar, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, } from "@/components/ui/sidebar"
import { Ham, LayoutDashboard, Shirt, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
]

export function AppSidebar() {
  const pathname = usePathname()

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
                    <Link href={item.url} className="flex items-center gap-3 px-3">
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
    </Sidebar>
  )
}