"use client";

import { logout } from "@/actions/logout";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => logout()}
      className="
        flex items-center gap-2
        h-10 px-4
        rounded-xl
        bg-red-600/90 text-white font-semibold
        shadow-md shadow-red-900/30
        hover:bg-red-500 hover:shadow-lg hover:shadow-red-900/50
        active:scale-95
        transition-all duration-200
        w-20
        absolute 
        bottom-8 
        right-8
        cursor-pointer
      "
    >
      <LogOut size={16} />
      Sair
    </Button>
  );
}
