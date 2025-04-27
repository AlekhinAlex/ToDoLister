// import { useState, useEffect } from "react";
// import { getToken, setToken, removeToken } from "../(tabs)/lib/storage";
// import { jwtDecode } from "jwt-decode";

// const API_BASE = "http://127.0.0.1:8000";

// const isTokenExpired = (token) => {
//   try {
//     const decoded = jwtDecode(token);
//     return (decoded.exp * 1000) - 60000 < Date.now(); // +60 секунд на буфер
//   } catch (e) {
//     console.log("Ошибка декодирования токена:", e);
//     return true;
//   }
// };

// const refreshAccessToken = async (refresh) => {
//   try {
//     const response = await fetch(`${API_BASE}/api/token/refresh/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refresh }),
//     });

//     if (!response.ok) {
//       throw new Error("Не удалось обновить токен");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Ошибка обновления токена:", error);
//     throw error;
//   }
// };

// const useAuth = () => {
//   const [token, setStoredToken] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const storedToken = await getToken();
//       if (!storedToken) {
//         setToken(null);
//         return;
//       }

//       if (isTokenExpired(storedToken.access)) {
//         if (storedToken.refresh && !isTokenExpired(storedToken.refresh)) {
//           try {
//             const newTokens = await refreshAccessToken(storedToken.refresh);
//             const updatedToken = {
//               access: newTokens.access,
//               refresh: storedToken.refresh,
//             };
//             await setToken(updatedToken);
//             setStoredToken(updatedToken);
//           } catch (error) {
//             console.error("Ошибка обновления сессии:", error);
//             await removeToken();
//             setStoredToken(null);
//           }
//         } else {
//           console.log("Refresh token expired or missing");
//           await removeToken();
//           setStoredToken(null);
//         }
//       } else {
//         setStoredToken(storedToken);
//       }
//     };

//     checkAuth();
//   }, []);

//   const logout = async () => {
//     await removeToken();
//     setStoredToken(null);
//   };

//   return { token, logout };
// };

// export default useAuth;
