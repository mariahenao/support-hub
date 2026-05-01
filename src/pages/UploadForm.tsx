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
      toast({ title: "Tipo de archivo no válido", description: "Solo se permiten archivos .dat, .zip y .bak.", variant: "destructive" });
      return false;
    }
    if (f.size === 0) {
      toast({ title: "Archivo vacío", description: "El archivo no puede estar vacío.", variant: "destructive" });
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
      toast({ title: "Campos incompletos", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // 1. Insert first to get the unique submission ID
      const { data: insertData, error: insertError } = await supabase
        .from("submissions")
        .insert({
          username: username.trim(),
          user_id: userId.trim(),
          file_url: "",
          status: "pending",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      const submissionId = insertData.id;

      // 2. Upload to Drive using the submission ID in the filename
      const fileUrl = await uploadToGoogleDrive(file, submissionId);

      // 3. Update the record with the actual file URL
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ file_url: fileUrl })
        .eq("id", submissionId);
      if (updateError) throw updateError;

      setSuccess(true);
      setUsername("");
      setUserId("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Enviado", description: "Tu archivo ha sido subido exitosamente." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Algo salió mal.";
      toast({ title: "Error al subir", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">POS Service Desk</CardTitle>
          <CardDescription>Sube tu archivo de soporte para revisión técnica</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
              <CheckCircle className="h-4 w-4" /> Solicitud recibida. La revisaremos pronto.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" placeholder="Ingresa tu usuario" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">ID de usuario</Label>
              <Input id="userId" placeholder="Ingresa tu ID de usuario" value={userId} onChange={(e) => setUserId(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Archivo de soporte</Label>
              <Input id="file" type="file" ref={fileInputRef} accept=".dat,.zip,.bak" onChange={handleFileChange} disabled={loading} className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">Formatos aceptados: .dat, .zip, .bak</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : <><Upload className="mr-2 h-4 w-4" /> Enviar</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadForm;
