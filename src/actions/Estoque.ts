"use server"
import  db  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- ACTIONS DE PRODUTOS ---

export async function SalvarProduto(dados: any) {
    try {
        const qtd = Number(dados.quantidade) || 0;
        const min = Number(dados.estoqueMinimo) || 0;

        const produto = await db.produtoEstoque.upsert({
            where: { id: dados.id || 'novo-id' },
            update: {
                nome: dados.nome,
                quantidade: qtd,
                estoqueMinimo: min,
                categoriaId: dados.categoriaId,
                unidade: dados.unidade,
                imagem: dados.imagem
            },
            create: {
                nome: dados.nome,
                quantidade: qtd,
                estoqueMinimo: min,
                categoriaId: dados.categoriaId,
                unidade: dados.unidade,
                imagem: dados.imagem
            }
        });

        if (qtd <= (min + 1)) {
            await db.listaCompra.upsert({
                where: { produtoId: produto.id },
                update: { 
                    nome: produto.nome,
                    quantidadeAtual: qtd,
                    minimoEsperado: min
                },
                create: {
                    produtoId: produto.id,
                    nome: produto.nome,
                    quantidadeAtual: qtd,
                    minimoEsperado: min,
                    unidade: produto.unidade || "un"
                }
            });
        } else {
            await db.listaCompra.deleteMany({
                where: { produtoId: produto.id }
            });
        }

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function buscarProdutos() {
    try {
        return await db.produtoEstoque.findMany({
            include: {
                categoria: true 
            },
            orderBy: { nome: 'asc' }
        });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return [];
    }
}

export async function DeletarProduto(id: string) {
    try {
        await db.produtoEstoque.delete({ where: { id } });
        revalidatePath("/PainelAlpha/PainelTarefas/PainelEstoque");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// --- ACTIONS DE CATEGORIAS ---

export async function SalvarCategoria(nome: string) {
    try {
        await db.categoria.create({
            data: { nome: nome.toUpperCase() }
        });
        revalidatePath("/PainelAlpha/PainelTarefas/PainelEstoque");
        return { success: true };
    } catch (error: any) {
        console.error("Erro Prisma Categoria:", error);
        return { success: false, error: "Categoria já existe ou erro no banco." };
    }
}

export async function buscarCategorias() {
    try {
        return await db.categoria.findMany({
            orderBy: { nome: 'asc' }
        });
    } catch (error) {
        return [];
    }
}

export async function DeletarCategoria(id: string) {
    try {
        await db.categoria.delete({ where: { id } });
        revalidatePath("/PainelAlpha/PainelTarefas/PainelEstoque");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não é possível excluir categorias com produtos ativos." };
    }
}


export async function RegistrarCompra(produtoId: string, quantidadeComprada: number) {
    try {
        const produto = await db.produtoEstoque.findUnique({ where: { id: produtoId } });
        if (!produto) return { success: false };

        const novaQuantidade = Number(produto.quantidade) + quantidadeComprada;

        await db.produtoEstoque.update({
            where: { id: produtoId },
            data: { quantidade: novaQuantidade }
        });

        if (novaQuantidade > Number(produto.estoqueMinimo)) {
            await db.listaCompra.deleteMany({ where: { produtoId } });
        } else {
            await db.listaCompra.updateMany({
                where: { produtoId },
                data: { quantidadeAtual: novaQuantidade }
            });
        }

        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}


// ---- Carrinho
export async function AdicionarAoCarrinho(produto: any) {
    try {
        await db.listaCompra.upsert({
            where: { produtoId: produto.id },
            update: { 
                status: "CARRINHO",
                nome: produto.nome,
                quantidadeAtual: Number(produto.quantidade),
                minimoEsperado: Number(produto.estoqueMinimo),
                categoriaId: produto.categoriaId
            },
            create: {
                produtoId: produto.id,
                nome: produto.nome,
                quantidadeAtual: Number(produto.quantidade),
                minimoEsperado: Number(produto.estoqueMinimo),
                unidade: produto.unidade || "un",
                status: "CARRINHO",
                categoriaId: produto.categoriaId 
            }
        });
        
        revalidatePath("/PainelAlpha/PainelEstoque");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}


export async function ConfirmarCarrinhoParaLista() {
    try {
        await db.listaCompra.updateMany({
            where: { status: "CARRINHO" },
            data: { status: "PENDENTE" }
        });
        
        revalidatePath("/PainelAlpha/PainelEstoque");
        revalidatePath("/PainelAlpha/PainelTarefas");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function RemoverDaLista(produtoId: string) {
    try {
        await db.listaCompra.delete({
            where: { produtoId: produtoId }
        });
        revalidatePath("/PainelAlpha/PainelEstoque");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function buscarListaCompra() {
    try {
        return await db.listaCompra.findMany({
            include: {
                categoria: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        return [];
    }
}
