import axios from "axios";

// Axios 기본 설정: 프로덕션에서 REACT_APP_API_URL이 비어 있으면 같은 오리진(상대 경로) 사용
const apiUrl = process.env.REACT_APP_API_URL;
axios.defaults.baseURL =
  apiUrl !== undefined && apiUrl !== ""
    ? apiUrl
    : process.env.NODE_ENV === "production"
      ? ""
      : "http://localhost:8080";

// Request Interceptor: 모든 요청에 자동으로 토큰 추가 (단, 공개 목록 API는 제외)
axios.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isPublicMovieList =
      url.includes("/api/v1/movie/search") || url.includes("/api/v1/movie/playing/search");
    if (isPublicMovieList) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 시 로그인 페이지로 리다이렉트 (단, 공개 API는 제외)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isPublicMovieApi =
        url.includes("/api/v1/movie/search") || url.includes("/api/v1/movie/playing/search");
      if (!isPublicMovieApi) {
        console.error("인증 실패: 로그인이 필요합니다.");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// 공개 목록 API 전용 인스턴스: 토큰을 절대 붙이지 않음 (카카오 로그인 후에도 목록 401 방지)
export const publicAxios = axios.create({
  baseURL: axios.defaults.baseURL,
});

export default axios;
