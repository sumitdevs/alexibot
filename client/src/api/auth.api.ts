import { api } from "./client";
import { 
  RegisterDTO,
  LoginDTO,
 } from "@/types";


 export async function registerApi(data: RegisterDTO) {
  const res = await api.post<any>("/auth/register", data);
  return res.data;
}

export async function loginApi(data: LoginDTO) {
  const res = await api.post<any>("/auth/login", data);
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
}
