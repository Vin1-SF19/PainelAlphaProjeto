"use server"
import db from "@/lib/prisma";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function getVideos() {
    try {
        const videos = await db.videos.findMany({
            include: {
                modulo: {
                    include: {
                        modulo: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return videos.map(v => ({
            ...v,
            modulo: v.modulo.map(m => m.modulo)
        }));
    } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
        return [];
    }
}

export async function getVideosDoModulo(moduloId: string) {
    try {
        const dados = await db.moduloVideo.findMany({
            where: { moduloId },
            include: { video: true },
            orderBy: { ordem: 'asc' }
        });
        return dados.map(item => ({ ...item.video, ordem: item.ordem }));
    } catch (error) {
        return [];
    }
}

export async function createVideo(input: {
    titulo: string;
    setor: string;
    url: string;
    descricao?: string;
    thumbUrl?: string;
    tamanho?: string;
    modulosIds: string[];
}) {
    try {
        const idsValidos = input.modulosIds.filter(id => id && id.length > 0);

        const video = await db.videos.create({
            data: {
                titulo: input.titulo,
                setor: input.setor,
                url: input.url,
                descricao: input.descricao || "",
                thumbUrl: input.thumbUrl || "",
                tamanho: input.tamanho || "",
                modulo: {
                    create: idsValidos.map((mId: string) => ({
                        modulo: {
                            connect: { id: mId }
                        }
                    }))
                }
            }
        });

        revalidatePath("/PainelAlpha/AlphaSkills/Gerenciamento");
        return { success: true, video };
    } catch (error: any) {
        console.error("ERRO NO CREATE:", error);
        return { success: false, error: error.message };
    }
}

export async function updateVideoOrder(moduloId: string, videoIds: string[]) {
    try {
        const updates = videoIds.map((id, index) =>
            db.moduloVideo.update({
                where: {
                    moduloId_videoId: { moduloId, videoId: id }
                },
                data: { ordem: index }
            })
        );

        await db.$transaction(updates);
        revalidatePath("/PainelAlpha/AlphaSkills");
        return { success: true };
    } catch (error) {
        console.error("Erro ao ordenar:", error);
        return { success: false, message: "Erro ao ordenar" };
    }
}

export async function deleteVideo(id: string, videoUrl: string, thumbUrl?: string) {
    try {
        await db.videos.deleteMany({
            where: { id }
        });

        try {
            const options = { token: process.env.SKILLS_READ_WRITE_TOKEN };
            if (videoUrl) await del(videoUrl, options);
            if (thumbUrl) await del(thumbUrl, options);
        } catch (blobErr) {
            console.warn("Arquivos não limpos no Blob.");
        }

        revalidatePath("/PainelAlpha/AlphaSkills");
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return { success: false };
    }
}

export async function updateVideoData(id: string, data: any) {
    try {
        const idsValidos = data.modulosIds.filter((mid: any) => mid);

        const video = await db.videos.update({
            where: { id },
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                url: data.url,
                thumbUrl: data.thumbUrl,
                setor: data.setor,
                modulo: {
                    deleteMany: {},
                    create: idsValidos.map((moduloId: string) => ({
                        modulo: {
                            connect: { id: moduloId }
                        }
                    }))
                }
            }
        });

        revalidatePath("/PainelAlpha/AlphaSkills");
        return video;
    } catch (error) {
        console.error("Erro ao atualizar vídeo:", error);
        throw error;
    }
}

export async function createModulo(nome: string, setor: string, imagemUrl: string, descricao: string) {
    try {
        await db.modulos.create({
            data: { nome, setor, imagemUrl, descricao }
        });
        revalidatePath("/PainelAlpha/AlphaSkills/Gerenciamento");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function getModulos() {
    try {
        return await db.modulos.findMany({
            orderBy: { nome: 'asc' }
        });
    } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        return [];
    }
}

export async function updateModulo(id: string, nome: string, setor: string, imagemUrl: string, descricao?: string) {
    try {
        await db.modulos.update({
            where: { id },
            data: { nome, setor, imagemUrl, descricao }
        });
        revalidatePath("/PainelAlpha/AlphaSkills/Gerenciamento");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}