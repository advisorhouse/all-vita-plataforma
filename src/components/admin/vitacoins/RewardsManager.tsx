import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

const RewardsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: 0,
    active: true,
    image_url: ""
  });

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("points_required", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (id: string | null) => {
      const payload = {
        name: formData.name,
        description: formData.description,
        points_required: formData.points_required,
        active: formData.active,
        metadata: { image_url: formData.image_url }
      };

      if (id) {
        const { error } = await supabase.from("rewards").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      toast.success(editingId ? "Prêmio atualizado" : "Prêmio criado");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao salvar prêmio: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      toast.success("Prêmio removido");
    }
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", points_required: 0, active: true, image_url: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (reward: any) => {
    setFormData({
      name: reward.name,
      description: reward.description || "",
      points_required: reward.points_required,
      active: reward.active,
      image_url: (reward.metadata as any)?.image_url || ""
    });
    setEditingId(reward.id);
    setIsAdding(true);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" /> Catálogo de Prêmios
          </CardTitle>
          <CardDescription>Gerencie as recompensas disponíveis para os parceiros</CardDescription>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Prêmio
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-8 p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Prêmio</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Kit VisionLift Premium" />
              </div>
              <div className="space-y-2">
                <Label>Pontos Necessários (ou Posição no Ranking)</Label>
                <Input type="number" value={formData.points_required} onChange={e => setFormData({...formData, points_required: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descreva o prêmio e os requisitos..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch checked={formData.active} onCheckedChange={val => setFormData({...formData, active: val})} />
                <Label>Ativo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
              <Button onClick={() => saveMutation.mutate(editingId)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {editingId ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Pontos/Meta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum prêmio cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.name}</TableCell>
                  <TableCell>{reward.points_required} pts</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${reward.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {reward.active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(reward)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                      if (confirm("Deseja remover este prêmio?")) deleteMutation.mutate(reward.id);
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RewardsManager;
