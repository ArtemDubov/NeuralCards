import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api-client";

export const cardSetsKeys = {
  all: ["cardSets"],
  details: () => [...cardSetsKeys.all, "detail"],
  detail: (id) => [...cardSetsKeys.details(), id],
};

export const useCardSets = () => {
  return useQuery({
    queryKey: cardSetsKeys.all,
    queryFn: async () => {
      const response = await apiClient.get("/api/cardSets");
      return response.data;
    },
  });
};

export const useCardSet = (id) => {
  return useQuery({
    queryKey: cardSetsKeys.detail(id),
    queryFn: async () => {
      if (!id || isNaN(id)) return null;
      try {
        const response = await apiClient.get(`/api/cardSets/${id}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!id && !isNaN(id),
    retry: false,
  });
};
