"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateExamPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const duration = parseInt(formData.get("duration") as string);

    try {
      const docRef = await addDoc(collection(db, "exams"), {
        title,
        duration,
        createdBy: user.uid,
        createdAt: new Date(),
      });
      toast({ title: "Success", description: "Exam created! Now add some questions." });
      router.push(`/dashboard/exams/${docRef.id}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Overview
      </Link>
      
      <Card className="border-none shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Create New Assessment</CardTitle>
            <CardDescription>Define the basics of your exam. You'll add questions in the next step.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" name="title" placeholder="e.g. Advanced Mathematics Final" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Time Limit (Minutes)</Label>
              <Input id="duration" name="duration" type="number" defaultValue="60" required />
              <p className="text-xs text-muted-foreground">Standard exams are usually between 30 and 120 minutes.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 mt-6">
            <Link href="/dashboard">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create & Add Questions"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}