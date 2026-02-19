'use client'

import loginAction from "@/lib/loginAction";
import Form from "next/form";
import Link from "next/link";
import { useActionState } from "react";

export default function LoginForm() {

  const [state, formAction, isPedding] = useActionState(loginAction, null);


  function Recover() {

  }

  return (
    <>
      {state?.success === false && (
        <div
          className="text-xs mb-6 bg-red-100 border text-red-700 px-4 py-3
        rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{state?.message}</span>
        </div>
      )}
      <Form action={formAction} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-2xl font-medium text-gray-100"
          >
            Email
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Seu email de login"
              required
              autoComplete="email"
              className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-2xl font-medium text-gray-100"
            >
              Senha
            </label>

            <div className="text-sm">
              <Link
                href="/RecuperarSenha" 
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Esqueceu Sua senha?
              </Link>
            </div>

          </div>

          <div className="mt-2">
            <input
              id="password"
              name="senha"
              type="password"
              placeholder="Sua senha"
              required
              autoComplete="current-password"
              className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md cursor-pointer bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Entrar
          </button>
        </div>

      </Form>
    </>
  );
}