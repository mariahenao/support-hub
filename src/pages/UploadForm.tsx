import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { uploadToGoogleDrive } from "@/lib/googleDrive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle } from "lucide-react";

const ALLOWED_EXTENSIONS = [".dat", ".zip", ".bak"];

const UploadForm = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (f: File) => {
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({ title: "Invalid file type", description: "Only .dat, .zip, and .bak files are allowed.", variant: "destructive" });
      return false;
    }
    if (f.size === 0) {
      toast({ title: "Empty file", description: "The file cannot be empty.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    } else {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !userId.trim() || !file) {
      toast({ title: "Missing fields", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const fileUrl = await uploadToGoogleDrive(file);

      const { error: insertError } = await supabase.from("submissions").insert({
        username: username.trim(),
        user_id: userId.trim(),
        file_url: fileUrl,
        status: "pending",
      });
      if (insertError) throw insertError;

      setSuccess(true);
      setUsername("");
      setUserId("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Success", description: "Your file has been uploaded successfully." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">POS Service Desk</CardTitle>
          <CardDescription>Upload your support file for technical review</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
              <CheckCircle className="h-4 w-4" /> Submission received. We'll review it shortly.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" placeholder="Enter your user ID" value={userId} onChange={(e) => setUserId(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Support File</Label>
              <Input id="file" type="file" ref={fileInputRef} accept=".dat,.zip,.bak" onChange={handleFileChange} disabled={loading} className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">Accepted formats: .dat, .zip, .bak</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Submit</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadForm;
