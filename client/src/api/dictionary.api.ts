import { api } from "./client";
import { WordDetails } from "@/types";

export interface ContextSearchRequest {
  word: string;
  context: string;
}

export async function searchWordWithContext(payload: ContextSearchRequest) {
  const res = await api.post<WordDetails>(
    "/dictionary/search/context",
    payload
  );

  return res.data;
}

export async function getWordBank() {
  const res = await api.get("/user/word-bank");
  return res.data;
}

export async function deleteWordBankItem(id: number) {
  await api.delete(`/user/word-bank/${id}`);
}

export async function getUserHistory() {
  const res = await api.get<any>("/user/history");
  return res.data;
}
