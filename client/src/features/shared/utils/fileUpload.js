import apiClient from "../../../api-client";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.fileUrl;
};
