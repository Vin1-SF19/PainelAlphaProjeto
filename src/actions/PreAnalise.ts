"use server";

import { auth } from "../../auth";

export async function executarPreAnalise(cnpj: string) {
    const session = await auth();
    if (!session) return { success: false, error: "Sessão expirada" };

    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        
        const [resReceita, resRadar, resEmpresaqui] = await Promise.all([
            fetch(`${baseUrl}/api/ReceitaFederal?cnpj=${cleanCnpj}`, { cache: 'no-store' }),
            fetch(`${baseUrl}/api/ConsultaRadar?cnpj=${cleanCnpj}`, { cache: 'no-store' }),
            fetch(`${baseUrl}/api/EmpresaAqui?cnpj=${cleanCnpj}`, { cache: 'no-store' })
        ]);

        
        const rfb = resReceita.ok ? await resReceita.json() : { error: true };
        const radar = resRadar.ok ? await resRadar.json() : { error: true };
        const empresaqui = resEmpresaqui.ok ? await resEmpresaqui.json() : { error: true };

        return {
            success: true,
            data: { rfb, radar, empresaqui }
        };

    } catch (error) {
        console.error("Erro Crítico na Action:", error);
        return { success: false, error: "Falha de conexão com o servidor de APIs" };
    }
}