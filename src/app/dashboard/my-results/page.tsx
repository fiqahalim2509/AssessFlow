"use client"

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Trophy, Clock, CheckCircle2 } from "lucide-react";

export default function MyResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!user) return;
      const q = query(
        collection(db, "attempts"), 
        where("userId", "==", user.uid),
        orderBy("submittedAt", "desc")
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchResults();
  }, [user]);

  if (loading) return <div>Loading your performance history...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">My Performance</h1>
        <p className="text-muted-foreground">Track your progress and review your assessment results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Average Score" value={`${results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0}%`} icon={Trophy} />
        <StatCard title="Exams Completed" value={results.length} icon={CheckCircle2} />
        <StatCard title="Best Score" value={`${results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}%`} icon={FileText} />
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="font-headline">Exam History</CardTitle>
          <CardDescription>Detailed list of all your submitted assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{res.examTitle}</TableCell>
                  <TableCell className="text-muted-foreground">{res.submittedAt?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${res.score >= 70 ? 'text-emerald-600' : res.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {res.score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Submitted</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    You haven't completed any exams yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card className="shadow-sm border-none bg-white">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-primary/5 rounded-xl text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold font-headline">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}