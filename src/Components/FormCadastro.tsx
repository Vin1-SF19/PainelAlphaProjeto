"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

import { LoaderCircle, Trash2, Pencil } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { getUsers } from "@/actions/get-user";
import { deleteUser, updateUser } from "@/actions/manage-user";
import { toast } from "sonner";
import Form from "next/form";
import registerAction from "../actions/CreateAction";
import EditionUser from "./EditionUser";
import DeleteUserDialog from "./DeleteUserDialog";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";



export default function CadastroUsuarios() {

  const [state, formAction, isPedding] = useActionState(registerAction, null);


  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleGetUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();

      setUsersList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    handleGetUsers();
  }, []);

  // --- DELETAR USUÁRIO ---
  const confirmDelete = async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete);
    if (result.success) {
      toast.success("Usuário deletado com sucesso!");
      handleGetUsers(); // Atualiza a lista
    } else {
      toast.error("Erro ao deletar usuário.");
    }
    setIsDeleteOpen(false);
    setUserToDelete(null);
  };

  // --- EDITAR USUÁRIO ---
  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userToEdit) {
      toast.error("Nenhum usuário selecionado para editar");
      return;
    }

    const formData = new FormData(e.currentTarget);

    console.log("Editando ID:", userToEdit.id);
    console.log("Nome enviado:", formData.get("nome"));

    const result = await updateUser(userToEdit.id, formData);

    if (result.success) {
      toast.success("Usuário atualizado com sucesso!");
      setIsEditOpen(false);
    } else {
      toast.error(result.error || "Erro ao atualizar.");
    }
  };


  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || "Usuário cadastrado com sucesso!");
      } else {
        toast.error(state.message || "Erro ao cadastrar usuário.");
      }
    }
  }, [state]);



  return (
    <>
      <section className="SectionUser">

        <div className="w-full min-h-screen grid grid-cols-2 gap-200">

          <div className="w-1/2 h-full p-6">
            <div className="w-200 h-full flex">

              <div className="w-full h-[90vh] flex flex-col p-10 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar">

                <div className="space-y-6">
                  <div className="titles border-b border-white/5 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Cadastrar Usuário</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mt-1">
                      Definição de Credenciais e Níveis de Acesso
                    </p>
                  </div>

                  <Form action={formAction} className="flex flex-col gap-6 items-start w-full">

                    <div className="grid gap-2 w-full">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</Label>
                      <Input name="nome" type="text" placeholder="EX: JOÃO SILVA" className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-600/50" required />
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full">
                      <div className="grid gap-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</Label>
                        <Input name="usuario" type="text" placeholder="USUARIO" className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-bold uppercase" required />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                        <Input name="senha" placeholder="************" type="password" className="h-12 bg-black/40 border-white/10 rounded-xl" required />
                      </div>
                    </div>

                    <div className="grid gap-2 w-full">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Corporativo</Label>
                      <Input name="email" type="email" placeholder="m@example.com" className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-bold" required />
                    </div>

                    <div className="w-full space-y-4 pt-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-emerald-500 ml-1">Módulos de Sistema</Label>
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {[
                          { id: "cadastro", label: "Painel Cadastro" },
                          { id: "radar", label: "Acessar Radar" },
                          { id: "chamados", label: "Fazer Chamados" },
                          { id: "Reservas", label: "Reservas de Salas" },
                          { id: "Documentos", label: "Documentos" },
                          { id: "UpDocumentos", label: "Uploads" },
                          { id: "Historico", label: "Histórico" }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-black/40 transition-all group">
                            <Label htmlFor={item.id} className="text-xs font-black uppercase tracking-tight cursor-pointer text-slate-400 group-hover:text-white leading-tight">
                              {item.label}
                            </Label>
                            <Switch id={item.id} name="permissoes" value={item.id} className="scale-90 data-[state=checked]:bg-blue-600" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 w-full pt-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-amber-500 ml-1">Permissão Hierárquica</Label>
                      <Select name="role" defaultValue="User">
                        <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-600/50">
                          <SelectValue placeholder="Selecione a permissão" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="Admin" className="text-xs font-black uppercase">Administrador MASTER</SelectItem>
                          <SelectItem value="OPERACIONAL" className="text-xs font-black uppercase">OPERACIONAL</SelectItem>
                          <SelectItem value="COMERCIAL" className="text-xs font-black uppercase">COMERCIAL</SelectItem>
                          <SelectItem value="RECURSOS HUMANOS" className="text-xs font-black uppercase">RECURSOS HUMANOS</SelectItem>
                          <SelectItem value="FINANCEIRO" className="text-xs font-black uppercase">FINANCEIRO</SelectItem>
                          <SelectItem value="JURÍDICO" className="text-xs font-black uppercase">JURÍDICO</SelectItem>
                          <SelectItem value="PARCEIRO" className="text-xs font-black uppercase">PARCEIRO</SelectItem>
                          <SelectItem value="SERVIÇOS GERAIS" className="text-xs font-black uppercase">SERVIÇOS GERAIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full h-16 mt-4 bg-blue-600 hover:bg-emerald-600 text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all duration-300 active:scale-95">
                      Finalizar Cadastro
                    </Button>
                  </Form>
                </div>

              </div>

            </div>
          </div>

          <div className="w-1/2 h-full p-6">
            <div className="w-200 h-full flex">

              <Card className="w-full h-full border-white/10 bg-slate-950/40 backdrop-blur-2xl text-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <CardHeader className="border-b border-white/5 p-10">
                  <CardTitle className="flex justify-between items-center text-2xl font-black uppercase tracking-tighter">
                    Equipe Alpha
                    <span className="text-xs font-black text-blue-400 bg-blue-600/10 border border-blue-600/20 px-6 py-2 rounded-full tracking-widest uppercase">
                      Ativos: {usersList.length}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-10 overflow-y-auto custom-scrollbar flex-1">
                  {loading ? (
                    <div className="flex flex-col justify-center items-center h-full gap-4 opacity-30">
                      <LoaderCircle className="animate-spin h-12 w-12 text-blue-500" />
                      <p className="text-xs font-black uppercase tracking-widest">Sincronizando...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {usersList.map((user: any) => (
                        <div key={user.id} className="group relative flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-black/20 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-blue-400 font-black text-base shadow-inner group-hover:scale-110 transition-transform">
                              {user.nome ? user.nome.substring(0, 2).toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-sm uppercase tracking-tight text-white">{user.nome || user.usuario}</span>
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user.email}</span>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-tight">{user.role || 'USER'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-blue-500/10 hover:bg-blue-600 hover:text-white rounded-xl text-blue-400 transition-all" onClick={() => { setUserToEdit(user); setIsEditOpen(true); }}>
                              <Pencil size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-red-500/10 hover:bg-red-600 hover:text-white rounded-xl text-red-400 transition-all" onClick={() => { setUserToDelete(user.id); setIsDeleteOpen(true); }}>
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

        </div>

        <EditionUser
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          user={userToEdit}
          onSubmit={handleUpdateSubmit}
        />

        <DeleteUserDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={confirmDelete}
        />

      </section>

    </>
  );
}