"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, User } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                toast.success("Bienvenido de nuevo")
                router.push("/")
                router.refresh()
            } else {
                const data = await res.json()
                toast.error(data.error || "Credenciales incorrectas")
            }
        } catch (error) {
            toast.error("Error en el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50 dark:bg-slate-950">
            <div className="relative w-full max-w-md space-y-6">
                {/* Background Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="bg-slate-900 p-3 rounded-2xl shadow-xl mb-2">
                        <Image src="/meca-logo.png" alt="Meca Logo" width={50} height={50} className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">La Meca CDA</h1>
                    <p className="text-sm text-muted-foreground">Panel de Control Administrativo</p>
                </div>

                <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
                        <CardDescription>
                            Ingresa tus credenciales para acceder al panel de control.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Tu usuario"
                                        className="pl-9 h-11"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9 h-11"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full h-11 font-semibold text-lg mt-4" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Acceder"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} La Meca CDA Sport Complex. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
