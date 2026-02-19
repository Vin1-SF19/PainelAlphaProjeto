import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            "https://api.infosimples.com/api/admin/account",
            {
                method: "POST", // a documentação mostra POST no curl
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    token: process.env.INFOSIMPLES_TOKEN!,
                }),
            }
        );

        const data = await response.json();

        if (data.code !== 200) {
            return NextResponse.json(
                { error: "Erro ao consultar InfoSimples" },
                { status: 400 }
            );
        }

        const conta = data.data[0];

        return NextResponse.json({
            saldo: conta.balance,
            consumo: conta.current_usage,
            fatura: conta.current_bill,
            limiteAlerta: conta.balance_threshold,
            prepaid: conta.prepaid,
            name: conta.name,
        });


        return NextResponse.json({ conta });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro interno ao consultar conta" },
            { status: 500 }
        );
    }
}
