import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Submission = {
  id: string;
  username: string;
  user_id: string;
  file_url: string;
  status: string;
  created_at: string;
};

type DiagnosticoRecord = Record<string, unknown>[];

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  valid: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  invalid: "bg-destructive text-destructive-foreground",
  processed: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  valid: "Válido",
  invalid: "Inválido",
  processed: "Procesado",
};

const getEffectiveStatus = (submission: Submission, diagnosticoSubmissionIds: Set<string>): string => {
  if (diagnosticoSubmissionIds.has(submission.id)) return "processed";
  return submission.status;
};

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [diagnosticoSubmissionIds, setDiagnosticoSubmissionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Diagnostico dialog state
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagData, setDiagData] = useState<DiagnosticoRecord | null>(null);
  const [diagSubmission, setDiagSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch submissions — don't filter "processed" in DB, it's computed client-side
      let query = supabase.from("submissions").select("*").order("created_at", { ascending: false });
      if (filter !== "all" && filter !== "processed") query = query.eq("status", filter);
      const { data: submissionsData, error: submissionsError } = await query;
      if (!submissionsError && submissionsData) setSubmissions(submissionsData);

      // Fetch diagnostico submission IDs
      const { data: diagData, error: diagError } = await supabase
        .from("diagnostico")
        .select("submissionId");
      if (!diagError && diagData) {
        setDiagnosticoSubmissionIds(
          new Set(
            diagData
              .map((d: { submissionId: string | null }) => d.submissionId)
              .filter((id): id is string => id !== null)
          )
        );
      }

      setLoading(false);
    };
    fetchData();
  }, [filter]);

  const handleViewDiagnostico = async (submission: Submission) => {
    setDiagSubmission(submission);
    setDiagData(null);
    setDiagOpen(true);
    setDiagLoading(true);
    console.log("looking for submissionId:", submission.id);
    const { data, error } = await supabase
      .from("diagnostico")
      .select("*")
      .eq("submissionId", submission.id);
    console.log("diagnostico result:", data, "error:", error);
    if (!error && data && data.length > 0) setDiagData(data as DiagnosticoRecord);
    setDiagLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl font-bold text-primary">Panel de envíos</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="valid">Válido</SelectItem>
              <SelectItem value="invalid">Inválido</SelectItem>
              <SelectItem value="processed">Procesado</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : submissions.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No se encontraron envíos.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>ID de usuario</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions
                    .filter((s) => {
                      if (filter !== "processed") return true;
                      return diagnosticoSubmissionIds.has(s.id);
                    })
                    .map((s) => {
                      const effectiveStatus = getEffectiveStatus(s, diagnosticoSubmissionIds);
                      const hasResults = diagnosticoSubmissionIds.has(s.id);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.username}</TableCell>
                          <TableCell>{s.user_id}</TableCell>
                          <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                              Descargar
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[effectiveStatus] || ""}>
                              {statusLabels[effectiveStatus] || effectiveStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {hasResults ? (
                              <Button variant="outline" size="sm" onClick={() => handleViewDiagnostico(s)}>
                                Ver resultados
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin resultados</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostico dialog */}
      <Dialog open={diagOpen} onOpenChange={setDiagOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Diagnóstico — {diagSubmission?.username} ({diagSubmission?.user_id})
            </DialogTitle>
          </DialogHeader>
          {diagLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : diagData && diagData.length > 0 ? (
            <div className="space-y-6">
              {diagData
                .filter((row) => row["submissionId"] !== null)
                .map((row, i) => (
                  <div key={i} className="rounded-md border p-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {row["created_at"] ? new Date(row["created_at"] as string).toLocaleString() : ""}
                    </p>
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {String(row["diagnostico"] ?? "—")}
                    </pre>
                  </div>
                ))}
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">No se encontraron resultados.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
