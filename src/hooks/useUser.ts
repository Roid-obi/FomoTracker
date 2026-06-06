import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/utils/api";
import type { UserModel } from "@/lib/models/user.model";

async function fetchUser(): Promise<UserModel.userData> {
  const res = await api.get<{ success: boolean; data: UserModel.userData }>(
    "/api/user",
  );
  return res.data.data;
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
}
