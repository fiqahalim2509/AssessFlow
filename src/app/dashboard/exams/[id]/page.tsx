"use client"

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Sparkles, Save, ChevronLeft } from "lucide-react";
import { adminGenerateExamQuestions } from "@/ai/flows/admin-generate-exam-questions";
import Link from "next/link";

export default function ManageExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchExamData() {
      const examSnap = await getDoc(doc(db, "exams", id));
      if (!examSnap.exists()) {
        router.push("/dashboard");
        return;
      }
      setExam({ id: examSnap.id, ...examSnap.data() });

      const qSnap = await getDocs(query(collection(db, "questions"), where("examId", "==", id)));
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchExamData();
  }, [id, router]);

  const handleAIQuestions = async () => {
    setGenLoading(true);
    try {
      const generated = await adminGenerateExamQuestions({
        topic: exam.title,
        numberOfQuestions: 5
      });

      for (const q of generated) {
        const docRef = await addDoc(collection(db, "questions"), {
          ...q,
          examId: id,
          createdAt: new Date()
        });
        setQuestions(prev => [...prev, { id: docRef.id, ...q }]);
      }

      toast({ title: "AI Generation Complete", description: `Added ${generated.length} new questions.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "AI generation failed." });
    } finally {
      setGenLoading(false);
    }
  };

  const deleteQuestion = async (qId: string) => {
    await deleteDoc(doc(db, "questions", qId));
    setQuestions(questions.filter(q => q.id !== qId));
    toast({ title: "Question removed" });
  };

  if (loading) return <div>Loading exam details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ChevronLeft /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">{exam.title}</h1>
          <p className="text-muted-foreground">Manage exam structure and questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-semibold">Questions ({questions.length})</h2>
            <Button variant="outline" onClick={handleAIQuestions} disabled={genLoading} className="gap-2 text-secondary border-secondary/20 hover:bg-secondary/10">
              <Sparkles className={`h-4 w-4 ${genLoading ? 'animate-spin' : ''}`} /> 
              {genLoading ? "Generating..." : "Generate AI Questions"}
            </Button>
          </div>

          {questions.map((q, idx) => (
            <Card key={q.id} className="relative group overflow-hidden border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-secondary uppercase tracking-widest">Question {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-lg font-medium mb-4">{q.question}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(q.options).map(([key, val]: [any, any]) => (
                    <div key={key} className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${q.correctAnswer === key ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100'}`}>
                      <span className="font-bold">{key}:</span>
                      <span>{val}</span>
                      {q.correctAnswer === key && <span className="ml-auto text-[10px] font-bold uppercase">Correct</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && !genLoading && (
            <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed">
              <p className="text-muted-foreground mb-4">No questions added yet.</p>
              <Button onClick={handleAIQuestions} className="gap-2">
                <Sparkles className="h-4 w-4" /> Use AI to build your exam
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm sticky top-24 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Exam Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input defaultValue={exam.title} />
              </div>
              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" defaultValue={exam.duration} />
              </div>
              <Button className="w-full gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}