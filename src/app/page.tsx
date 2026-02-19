
import LoginForm from "../Components/loginForm";

export default async function LoginPage() {


  return (
        <div className="flex relative min-h-full w-xl flex-col m-auto  px-6 py-12 lg:px-8 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Sua logo"
            src="/Logotipo-1.png"
            className="mx-auto w-120 h-30"
            />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Entre com sua conta</h2>
          <p className="text-gray-400 m-3">Apenas usuarios cadastrados pelo Administrador poderá fazer login</p>
        </div>


        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginForm/>
          
        </div>
      </div>
  );
}