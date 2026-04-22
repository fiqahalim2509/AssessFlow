"use client"

import { useAuth } from "@/hooks/use-auth";
import AdminOverview from "@/components/admin/AdminOverview";
import CandidateOverview from "@/components/candidate/CandidateOverview";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'admin' ? <AdminOverview /> : <CandidateOverview />;
}