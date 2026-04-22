"use client"

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, FileText, Calendar } from "lucide-react";
import Link from "next/link";

export default function CandidateOverview() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">Available Assessments</h1>
        <p className="text-muted-foreground">Browse and start your examinations from the list below.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-48 bg-white/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="shadow-sm border-none bg-white hover:shadow-md transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none">Active</Badge>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="font-headline text-xl group-hover:text-secondary transition-colors">{exam.title}</CardTitle>
                <CardDescription className="line-clamp-2">Complete this examination within the allotted time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {exam.duration} Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Objective Multiple Choice</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/dashboard/exams/${exam.id}/start`} className="w-full">
                  <Button className="w-full gap-2 group-hover:bg-secondary transition-colors">
                    <Play className="h-4 w-4 fill-current" /> Start Exam
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {exams.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/50 rounded-xl border border-dashed">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No exams available yet.</h3>
              <p className="text-muted-foreground">Check back later for new assessments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}