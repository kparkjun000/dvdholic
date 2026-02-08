import axios from "axios";

// Axios 기본 설정
axios.defaults.baseURL = "http://localhost:8080";

// Request Interceptor: 모든 요청에 자동으로 토큰 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 시 로그인 페이지로 리다이렉트
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("인증 실패: 로그인이 필요합니다.");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      // 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
