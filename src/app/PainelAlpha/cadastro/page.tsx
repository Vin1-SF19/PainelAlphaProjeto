import { auth } from '../../../../auth'
import HeaderUser from "@/Components/HeaderUser";
import CadastroUsuarios from "@/Components/FormCadastro";
import { redirect } from 'next/navigation';

export default async function CadastroPage() {

  const session = await auth();

  if (session?.user?.role !== "Admin" && !session?.user?.permissoes?.includes("cadastro")) {
    redirect("/"); // Expulsa se tentar entrar pelo link
  }

  if (!session) {
    redirect("/");
  }

  return (
    <section className="SectionUser">
      <HeaderUser user={session?.user} />


      <div className="ContainerUser m-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CadastroUsuarios />
      </div>
    </section>
  );
}
