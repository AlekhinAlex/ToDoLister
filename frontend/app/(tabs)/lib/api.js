import { getToken } from "./storage";

export const API_BASE = "https://todolister-edw1.onrender.com";

export const createTask = async (taskData, accessToken) => {
  try {
    const response = await fetch(`${API_BASE}/api/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Детали ошибки создания задачи:", errorData);
      throw new Error(errorData.detail || "Не удалось создать задачу");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
    throw error;
  }
};

export const updateTask = async (taskId, taskData, accessToken) => {
  try {
    const response = await fetch(`${API_BASE}/api/tasks/${taskId}/`, {
      method: "PUT", // или PATCH, если обновляешь не всё
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Не удалось обновить задачу");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при обновлении задачи:", error);
    throw error;
  }
};

export const uploadAvatar = async (uri, accessToken) => {
  if (!uri) {
    throw new Error("URI изображения не передан");
  }

  const formData = new FormData();
  formData.append('avatar', {
    uri: uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  });

  const response = await fetch(`${API_BASE}/api/user/upload_avatar/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Ошибка загрузки аватарки");
  }

  return await response.json();
};








