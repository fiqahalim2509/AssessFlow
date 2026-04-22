"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LayoutDashboard, ListChecks, FileText, BarChart3, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <GraduationCap className="h-12 w-12 text-primary mb-4" />
          <p className="text-lg font-medium">Loading AssessFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navItems = user.role === 'admin' ? [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Exams", icon: FileText, href: "/dashboard/exams" },
    { label: "Results", icon: BarChart3, href: "/dashboard/results" },
  ] : [
    { label: "Available Exams", icon: ListChecks, href: "/dashboard" },
    { label: "My Results", icon: BarChart3, href: "/dashboard/my-results" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col border-r">
        <div className="p-6 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-secondary" />
          <span className="font-headline font-bold text-xl tracking-tight">AssessFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/10 hover:text-white">
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs opacity-60 capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="h-16 border-b bg-white/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-headline font-semibold text-xl text-primary">Dashboard</h2>
          <div className="flex items-center gap-4">
             {/* Dynamic header stuff could go here */}
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}