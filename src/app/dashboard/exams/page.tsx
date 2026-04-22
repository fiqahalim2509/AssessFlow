"use client"

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Edit, FileText, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ExamsAdminPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchExams() {
      const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchExams();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam? All associated questions will remain in the database but be orphaned.")) {
      await deleteDoc(doc(db, "exams", id));
      setExams(exams.filter(e => e.id !== id));
      toast({ title: "Exam deleted" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Exams Repository</h1>
          <p className="text-muted-foreground">Create, edit, and organize your platform assessments.</p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Exam</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="shadow-sm border-none bg-white hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-xl">{exam.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                    {exam.duration} Min
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="py-4 border-y border-gray-50 bg-gray-50/30">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Created</p>
                  <p className="text-sm">{exam.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Candidates</p>
                  <p className="text-sm">45 Active</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 flex gap-2">
              <Link href={`/dashboard/exams/${exam.id}`} className="flex-1">
                <Button variant="secondary" className="w-full gap-2">
                  <Edit className="h-4 w-4" /> Manage
                </Button>
              </Link>
              <Button variant="outline" size="icon">
                 <MoreVertical className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {exams.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white/50 rounded-xl border border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No exams created.</h3>
            <p className="text-muted-foreground mb-6">Start by creating your first assessment.</p>
            <Link href="/dashboard/exams/new">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Create First Exam</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}