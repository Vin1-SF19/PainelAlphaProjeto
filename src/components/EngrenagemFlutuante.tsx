"use client";

import { useEffect, useState } from "react";
import { Settings, Megaphone, Activity } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/temas";
import { ModalBroadcast } from "./ModalBroadcast"; 

export function EngrenagemFlutuante() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  if (session?.user?.role !== "Admin") return null;
  const style = getTema((session?.user as any)?.tema_interface);

useEffect(() => {
  const syncTheme = () => {
    const cached = localStorage.getItem("alpha-theme-temp");
    if (cached) {
    }
  };

  syncTheme();
  window.addEventListener("storage", syncTheme);
  return () => window.removeEventListener("storage", syncTheme);
}, []);


  return (
    <>
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3">
        {showMenu && (
          <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl p-2 rounded-2xl shadow-2xl mb-2 animate-in slide-in-from-bottom-5 duration-300 flex flex-col gap-1 w-52">
            <button 
              onClick={() => { setIsBroadcastOpen(true); setShowMenu(false); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all group"
            >
              <Megaphone size={16} className={style.text} /> 
              Broadcast Global
            </button>
            <button 
              onClick={() => { router.push("/PainelAlpha/UsuariosOnline"); setShowMenu(false); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all group"
            >
              <Activity size={16} className="text-emerald-500" /> 
              Agentes Online
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 group hover:scale-110 active:scale-95 bg-slate-900/40 ${style.border.replace('20', '40')} cursor-pointer`}
        >
          <Settings 
            size={26} 
            className={`${style.text} ${showMenu ? 'rotate-90' : 'animate-[spin_10s_linear_infinite]'} transition-transform duration-500`} 
          />
        </button>
      </div>

      <ModalBroadcast 
        isOpen={isBroadcastOpen} 
        onClose={() => setIsBroadcastOpen(false)} 
        style={style} 
      />
    </>
  );
}
