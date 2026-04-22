"use client"

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";

export default function ExamSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const examSnap = await getDoc(doc(db, "exams", id));
      if (!examSnap.exists()) return router.push("/dashboard");
      const examData = examSnap.data();
      setExam({ id: examSnap.id, ...examData });
      setTimeLeft(examData.duration * 60);

      const qSnap = await getDocs(query(collection(db, "questions"), where("examId", "==", id)));
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      const finalScore = Math.round((score / questions.length) * 100);

      await addDoc(collection(db, "attempts"), {
        userId: user?.uid,
        userName: user?.displayName,
        examId: id,
        examTitle: exam.title,
        answers,
        score: finalScore,
        status: "submitted",
        submittedAt: serverTimestamp(),
      });

      toast({ title: "Exam Submitted", description: `You scored ${finalScore}%` });
      router.push("/dashboard/my-results");
    } catch (err) {
      toast({ variant: "destructive", title: "Error submitting exam" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-20 text-center">Loading exam environment...</div>;

  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <div className="p-6 bg-white rounded-2xl shadow-xl border-none">
          <CardTitle className="text-3xl font-headline mb-4">{exam.title}</CardTitle>
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-secondary mb-2" />
              <span className="text-sm text-muted-foreground uppercase font-bold">Duration</span>
              <span className="text-xl font-headline">{exam.duration} Mins</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-8 w-8 text-secondary mb-2" />
              <span className="text-sm text-muted-foreground uppercase font-bold">Questions</span>
              <span className="text-xl font-headline">{questions.length} Total</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-4 text-left mb-8">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Once started, the timer cannot be paused. Please ensure you have a stable internet connection and 
              adequate time to complete the assessment in one sitting.
            </p>
          </div>
          <Button size="lg" className="w-full h-14 text-lg" onClick={() => setExamStarted(true)}>
            I am Ready to Start
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col h-[calc(100vh-160px)]">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-primary">{exam.title}</h2>
          <p className="text-sm text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full font-headline font-bold text-xl ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-primary/5 text-primary'}`}>
          <Clock className="h-5 w-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-12" />

      <div className="flex-1 overflow-auto pr-4">
        <Card className="border-none shadow-sm bg-white mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-body leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={answers[currentQ.id]} 
              onValueChange={(val) => setAnswers({...answers, [currentQ.id]: val})}
              className="space-y-4"
            >
              {Object.entries(currentQ.options).map(([key, val]: [any, any]) => (
                <div key={key} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all hover:bg-primary/5 ${answers[currentQ.id] === key ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}>
                  <RadioGroupItem value={key} id={`option-${key}`} />
                  <Label htmlFor={`option-${key}`} className="flex-1 text-lg font-medium cursor-pointer">{val}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8 border-t pt-8">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} 
          disabled={currentIdx === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {currentIdx === questions.length - 1 ? (
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white px-12 h-12 gap-2" 
            onClick={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Final Submit"} <CheckCircle2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            className="gap-2"
          >
            Next Question <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}