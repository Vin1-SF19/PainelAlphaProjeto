import { Button } from "@/Components/ui/button";
import Link from "next/link";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import LogoutUser from "@/Components/LogoutUser";
import { UserIcon } from "lucide-react";
import { AbaDeAcesso } from "@/Components/AbaDeAcesso";

export const dynamic = "force-dynamic";

type UserProps = {
  user?: {
    nome?: string;
    usuario?: string;
    email?: string | null;
    role?: string;
  };
};

export default async function PainelAlpha({ user }: UserProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-24">
      {/* HEADER */}
      <div className="mb-16 rounded-3xl border border-blue-900/40 bg-slate-900/50 backdrop-blur-xl shadow-xl p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bem-vindo,{" "}
            <span className="text-blue-500">{session.user.nome}</span>
          </h1>

          <div className="mt-3 flex items-center gap-3 text-gray-400">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <UserIcon size={20} className="text-blue-500" />
            </div>
            <span className="text-sm">
              Painel administrativo do sistema
            </span>
          </div>
        </div>

        <LogoutUser />
      </div>

      {/* GRID DE MÓDULOS */}

      <section className="mx-auto max-w-7xl grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {/* CARD RADAR */}
        <AbaDeAcesso
          permissaoRequerida="radar"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >

          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../bar-chart_1573395.png"
              alt="Radar"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Coletor de Habilitação RADAR
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Consultas unitárias ou em lote via API, com exportação completa para
              Excel.
            </p>

            <Link href="./PainelAlpha/HabilitacaoRadar">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Acessar módulo
              </Button>
            </Link>
          </div>
        </AbaDeAcesso>

        {/* CARD CHAMADOS */}
        <AbaDeAcesso
          permissaoRequerida="chamados"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >
          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../discussion_655664.png"
              alt="Chamados"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Chamados Internos
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Abra chamados, acompanhe status e registre incidentes para o time de
              TI.
            </p>

            <Link href="./PainelAlpha/Chamados">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Central de chamados
              </Button>

            </Link>
          </div>
        </AbaDeAcesso>

        {/* CARD USUÁRIOS */}
        <AbaDeAcesso
          permissaoRequerida="cadastro"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >
          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../people_10893485.png"
              alt="Usuários"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Administração de Usuários
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Gerencie contas, permissões, perfis e status dos usuários do sistema.
            </p>

            <Link href="/PainelAlpha/cadastro">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Gerenciar usuários
              </Button>
            </Link>
          </div>
        </AbaDeAcesso>



        {/* Card Reserva de salas*/}
        <AbaDeAcesso
          permissaoRequerida="Reservas"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >
          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../icons8-sala-de-reuniões-64.png"
              alt="Usuários"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Reservas de Salas
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Pagina dedicada para reservar salas com data e horas.
            </p>

            <Link href="/PainelAlpha/ReservaSalas">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Acessar Reservas
              </Button>
            </Link>
          </div>
        </AbaDeAcesso>



        {/* Card DropDawn de documentos*/}
        <AbaDeAcesso
          permissaoRequerida="Documentos"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >
          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../pasta.png"
              alt="Usuários"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Sala de Documentos
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Pagina dedicada para Documentos de guia para algumas funçoes.
            </p>

            <Link href="/PainelAlpha/DocsAlpha">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Acessar Documentos
              </Button>
            </Link>
          </div>
        </AbaDeAcesso>

  {/* Card Gerenciamento de arquivos*/}
        <AbaDeAcesso
          permissaoRequerida="Documentos"
          userRole={session?.user?.role}
          userPermissions={session?.user?.permissoes}
        >
          <div className="group rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-blue-900/40">
            <img
              src="../pasta.png"
              alt="Usuários"
              className="w-12 mb-4 opacity-90"
            />

            <h3 className="text-xl font-bold text-white mb-3">
              Gerenciamento de Arquivos
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Pagina dedicada para fazer Uploads de arquivos
            </p>

            <Link href="/PainelAlpha/GerenciamentoArquivos">
              <Button className="cursor-pointer w-full text-lg font-bold bg-blue-700 hover:bg-blue-500 transition-all shadow-md">
                Acessar Arquivos
              </Button>
            </Link>
          </div>
        </AbaDeAcesso>


      </section>
    </div>
  );
}
