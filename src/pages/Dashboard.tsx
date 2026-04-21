import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type Submission = {
  id: string;
  username: string;
  user_id: string;
  file_url: string;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
  valid: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
  invalid: "bg-destructive text-destructive-foreground",
};

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      let query = supabase.from("submissions").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("status", filter);
      const { data, error } = await query;
      if (!error && data) setSubmissions(data);
      setLoading(false);
    };
    fetchSubmissions();
  }, [filter]);

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
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
                        <Badge className={statusColors[s.status] || ""}>{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
