import { getToken } from "./storage";

export const API_BASE = "https://todolister-edw1.onrender.com";
//export const API_BASE = "http://127.0.0.1:8000";

export const createTask = async (taskData, accessToken) => {
  try {
    // Убедимся, что отправляем только нужные поля
    const payload = {
      title: taskData.title,
      description: taskData.description,
      difficulty: parseInt(taskData.difficulty),
      type: parseInt(taskData.type),
      collaboration_type: parseInt(taskData.collaboration_type || 1),
      // Не отправляем collaborators здесь - они отправляются отдельно
    };

    console.log('Отправляемые данные задачи:', payload);

    const response = await fetch(`${API_BASE}/api/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Детали ошибки от сервера:', errorData);
      throw new Error(errorData.detail || `Не удалось создать задачу: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
    throw error;
  }
};

export const updateTask = async (taskId, taskData, accessToken) => {
  try {
    const payload = {
      title: taskData.title,
      description: taskData.description,
      difficulty: parseInt(taskData.difficulty),
      type: parseInt(taskData.type),
      collaboration_type: parseInt(taskData.collaboration_type || 1),
      is_completed: taskData.is_completed || false,
    };

    console.log('Отправляемые данные для обновления:', payload);

    const response = await fetch(`${API_BASE}/api/tasks/${taskId}/`, {
      method: "PATCH", // Используем PATCH для частичного обновления
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Детали ошибки от сервера:', errorData);
      throw new Error(errorData.detail || `Не удалось обновить задачу: ${response.statusText}`);
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








