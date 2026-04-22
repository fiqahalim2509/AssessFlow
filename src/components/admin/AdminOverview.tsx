"use client"

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, CheckCircle, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = useState({ exams: 0, users: 0, attempts: 0 });
  const [recentExams, setRecentExams] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const examsSnap = await getDocs(collection(db, "exams"));
      const usersSnap = await getDocs(collection(db, "users"));
      const attemptsSnap = await getDocs(collection(db, "attempts"));
      
      setStats({
        exams: examsSnap.size,
        users: usersSnap.size,
        attempts: attemptsSnap.size
      });

      const q = query(collection(db, "exams"), orderBy("createdAt", "desc"), limit(5));
      const recentSnap = await getDocs(q);
      setRecentExams(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Welcome Back, Admin</h1>
          <p className="text-muted-foreground">Monitor your platform's performance and manage assessments.</p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create New Exam
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Exams" value={stats.exams} icon={FileText} trend="+2 this week" />
        <StatCard title="Candidates" value={stats.users} icon={Users} trend="+12 new" />
        <StatCard title="Exam Attempts" value={stats.attempts} icon={CheckCircle} trend="+45% vs last month" />
        <StatCard title="Average Score" value="76%" icon={TrendingUp} trend="Stable" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-none bg-white/70">
          <CardHeader>
            <CardTitle className="font-headline">Recent Exams</CardTitle>
            <CardDescription>Latest assessments created on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.duration} mins</TableCell>
                    <TableCell>{new Date(exam.createdAt?.toDate()).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/exams/${exam.id}`}>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {recentExams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No exams created yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white/70">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Plus className="h-5 w-5 text-secondary" /> Add Single Question
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Users className="h-5 w-5 text-secondary" /> Bulk Import Candidates
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <BarChart3 className="h-5 w-5 text-secondary" /> Export Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="shadow-sm border-none bg-white/70">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/5 rounded-lg text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h4 className="text-2xl font-bold font-headline">{value}</h4>
      </CardContent>
    </Card>
  );
}

import { BarChart3 } from "lucide-react";