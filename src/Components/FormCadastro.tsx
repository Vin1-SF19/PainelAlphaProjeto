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
        // Opcional: fechar modal ou resetar formulário aqui
      } else {
        toast.error(state.message || "Erro ao cadastrar usuário.");
      }
    }
  }, [state]);



  return (
    <>
      <section className="SectionUser">


        <div className="ContainerUser p-5 grid grid-cols-2 lg:grid-cols-2 gap-6 items-start">


          {/* LADO ESQUERDO: Formulario de Cadastro */}
          <div className="FormCadastro w-full flex flex-col gap-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

            <div>
              <div className="titles">

                <h1 className="font-bold text-white">Cadastrar Usuários</h1>
                <p className="text-sm text-gray-400">
                  Crie e cadastre usuarios / Definir permissoes de Usuarios
                </p>
              </div>
              <Form action={formAction} className="flex flex-col gap-6 border-none justify-end-safe items-start">
                <div className="grid gap-2 w-130">
                  <Label>Nome Completo</Label>
                  <Input name="nome" type="Text" placeholder="Nome" required />
                </div>

                <div className="grid gap-2 w-130">
                  <Label>Nome de usuario</Label>
                  <Input name="usuario" type="text" placeholder="Usuario" required />
                </div>

                <div className="grid gap-2 w-130">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>

                <div className="grid gap-2 w-130">
                  <div className="flex items-center">
                    <Label>Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                  <Input name="senha" placeholder="************" type="password" required />
                </div>


                <div className="permissoes grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="cadastro" name="permissoes" value="cadastro" />
                    <Label htmlFor="cadastro" >Acessar painel de cadastro</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="radar" name="permissoes" value="radar" />
                    <Label htmlFor="radar">Acessar Radar</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="chamados" name="permissoes" value="chamados" />
                    <Label htmlFor="chamados">Fazer Chamados</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="Reservas" name="permissoes" value="Reservas" />
                    <Label htmlFor="Reservas">Fazer Reservas de salas</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="Documentos" name="permissoes" value="Documentos" />
                    <Label htmlFor="Reservas">Acessar sala de Documentos</Label>
                  </div>

                </div>

                <div className="grid gap-3">


                  <Label>Permissão</Label>

                  <Select name="role" defaultValue="User">
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">TI.Administrador</SelectItem>
                      <SelectItem value="OPERACIONAL">OPERACIONAL</SelectItem>
                      <SelectItem value="COMERCIAL">COMERCIAL</SelectItem>
                      <SelectItem value="RECURSOS HUMANOS">RECURSOS HUMANOS</SelectItem>
                      <SelectItem value="FINANCEIRO">FINANCEIRO</SelectItem>
                      <SelectItem value="JURÍDICO">JURÍDICO</SelectItem>
                      <SelectItem value="PARCEIRO">PARCEIRO</SelectItem>
                    </SelectContent>
                  </Select>


                </div>

                <div className="w-full justify-center flex">
                  <Button
                    type="submit"
                    className="w-100 bg-slate-700/80 hover:bg-green-600 duration-500 transition-all ease-in-out cursor-pointer"
                  >
                    Cadastrar
                  </Button>
                </div>

              </Form>
            </div>
          </div>



          {/* LADO DIREITO: Lista de Usuários */}
          <Card className="UserList border-slate-800 bg-slate-900/60 text-white min-h-[500px]">

            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Usuários Cadastrados
                <span className="text-xs font-normal text-gray-400 bg-slate-800 px-2 py-1 rounded-full">
                  Total: {usersList.length}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <LoaderCircle className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {usersList.map((user: any) => (
                    <div
                      key={user.id}
                      className="cursor-pointer flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-100 font-bold">
                          {user.nome ? user.nome.substring(0, 2).toUpperCase() : "U"}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-white">{user.nome || user.usuario}</span>
                          <span className="text-xs text-gray-400">{user.email}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">

                        {/* Botão EDITAR */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-blue-400 hover:bg-blue-400/10 h-8 w-8"
                          onClick={() => {
                            setUserToEdit(user);
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>

                        {/* Botão DELETAR */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                          onClick={() => {
                            setUserToDelete(user.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- MODAL DE EDIÇÃO --- */}
        <EditionUser
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          user={userToEdit}
          onSubmit={handleUpdateSubmit}
        />

        {/* --- MODAL DE EXCLUSÃO (ALERT) --- */}
        <DeleteUserDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={confirmDelete}
        />


      </section>
    </>
  );
}