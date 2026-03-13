import { NextResponse } from "next/server";
import https from "https";

export const dynamic = 'force-dynamic';

async function consultarExterno(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { 
            rejectUnauthorized: false,
            family: 4, 
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error("Resposta não é um JSON válido"));
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.end();
    });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");
        
        const token = process.env.EMPRESAQUI_TOKEN?.trim();

        if (!cnpj || !token) {
            return NextResponse.json({ error: "CNPJ ou Token ausentes" }, { status: 400 });
        }

        const urlEA = `https://www.empresaqui.com.br/api/${token}/${cnpj}`;
        
        console.log("📡 [EA] Tentando conectar em:", urlEA);

        const dados = await consultarExterno(urlEA);
        
        return NextResponse.json(dados);

    } catch (err: any) {
        console.error("🔥 [EA] ERRO FÍSICO:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
