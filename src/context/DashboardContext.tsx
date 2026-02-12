"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface DashboardContextType {
    overviewData: any
    setOverviewData: (data: any) => void
    evolutionData: any[]
    setEvolutionData: (data: any[]) => void
    lastFetchParams: {
        month: string
        year: string
        evolutionRange: string
    } | null
    setLastFetchParams: (params: any) => void
    refresh: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [overviewData, setOverviewData] = useState<any>(null)
    const [evolutionData, setEvolutionData] = useState<any[]>([])
    const [lastFetchParams, setLastFetchParams] = useState<any>(null)

    const refresh = () => {
        setOverviewData(null)
        setEvolutionData([])
        setLastFetchParams(null)
    }

    return (
        <DashboardContext.Provider
            value={{
                overviewData,
                setOverviewData,
                evolutionData,
                setEvolutionData,
                lastFetchParams,
                setLastFetchParams,
                refresh,
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}
