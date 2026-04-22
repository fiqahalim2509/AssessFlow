"use client"

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAllResults() {
      const q = query(collection(db, "attempts"), orderBy("submittedAt", "desc"));
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchAllResults();
  }, []);

  const filteredResults = results.filter(r => 
    r.userName?.toLowerCase().includes(search.toLowerCase()) || 
    r.examTitle?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading global analytics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Global Results</h1>
          <p className="text-muted-foreground">Monitor and export candidate performance data across all exams.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by candidate name or exam title..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Candidate</TableHead>
                <TableHead>Exam Title</TableHead>
                <TableHead>Submission Time</TableHead>
                <TableHead>Final Score</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="pl-6 font-medium">{res.userName || 'Anonymous'}</TableCell>
                  <TableCell>{res.examTitle}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {res.submittedAt?.toDate().toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                           className={`h-full ${res.score >= 70 ? 'bg-emerald-500' : res.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                           style={{ width: `${res.score}%` }}
                         />
                       </div>
                       <span className="font-bold text-sm">{res.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No matching result records found.
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