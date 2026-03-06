"use client";

import { useState } from "react";
import { Pencil, LoaderCircle } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { atualizarFotoPerfilAction } from "@/actions/perfil";
import { useSession } from "next-auth/react"; 

export function AvatarUpload({ inicial, fotoAtual }: { inicial: string, fotoAtual?: string | null }) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(fotoAtual);
    const { update } = useSession(); 

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        
      
        setLoading(true);
        const toastId = toast.loading("Sincronizando foto no Dossiê...");
      
        try {
          console.log("🚀 Iniciando fetch para /api/chat/upload...");
          const response = await fetch(`/api/chat/upload?filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: file,
          });
      
          console.log("📡 Resposta do servidor recebida:", response.status);
          
      
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Erro no servidor: ${errorText}`);
          }
      
          const newBlob = await response.json();
          console.log("✅ Blob gerado:", newBlob.url);
      
          const res = await atualizarFotoPerfilAction(newBlob.url);

            
            if (res.success) {
              setPreview(newBlob.url);
              
              await update({
                user: { imagemUrl: newBlob.url }
              });

            toast.success("Identidade atualizada!", { id: toastId });


          } else {
            throw new Error(res.error);
          }
        } catch (error: any) {
          console.error("❌ FALHA NO UPLOAD:", error.message);
          toast.error(`Erro: ${error.message}`, { id: toastId });
        } finally {
          setLoading(false);
        }
      };
      

    const handleRemove = async () => {
        if (!confirm("Deseja remover sua foto de perfil?")) return;

        const toastId = toast.loading("Removendo do dossiê...");
        const res = await atualizarFotoPerfilAction(null);

        if (res.success) {
            setPreview(undefined);
            toast.success("Foto removida.", { id: toastId });
        } else {
            toast.error("Falha ao excluir.");
        }
    };


    return (
        <div className="relative group">
            <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-blue-500/50">
                {loading ? (
                    <LoaderCircle className="animate-spin text-blue-500" size={32} />
                ) : preview ? (
                    <img src={preview} alt="Perfil" className="h-full w-full object-cover" />
                ) : (
                    <span className="text-4xl font-black text-white italic">{inicial}</span>
                )}
            </div>

            <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 rounded-2xl border-4 border-[#020617] cursor-pointer hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40">
                <Pencil size={16} className="text-white" />
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={loading}
                />
            </label>
        </div>
    );
}
