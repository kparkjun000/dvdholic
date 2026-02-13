import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // /login API에 POST 요청
      const response = await axios.post("/api/v1/auth/login", {
        email: username,
        password,
      });

      if (!response.data.success) {
        const msg = response.data.message || response.data.code || "알 수 없는 오류";
        alert("로그인 실패. " + msg);
      } else {
        // 응답이 성공하면 로그인 처리 (토큰 저장 등)
        // 예: localStorage에 토큰 저장
        localStorage.setItem("token", response.data.data.accessToken);
        localStorage.setItem("refresh_token", response.data.data.refreshToken);
        // 이후 페이지 이동 또는 로그인 처리 로직 추가
        setIsLoggedIn(true);
        // 예: 대시보드로 이동
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const serverMsg = error.response?.data?.message || error.response?.data?.code;
      const displayMsg = serverMsg
        ? "로그인 실패. " + serverMsg
        : "로그인 실패: 이메일 또는 비밀번호를 확인해 주세요.";
      alert(displayMsg);
    }
  };

  const handleKakaoLogin = () => {
    // 프로덕션(Heroku 등)에서는 현재 오리진 사용. 로컬만 localhost:8080 사용
    const apiBase =
      process.env.REACT_APP_API_URL !== undefined && process.env.REACT_APP_API_URL !== ""
        ? process.env.REACT_APP_API_URL
        : process.env.NODE_ENV === "production"
          ? window.location.origin
          : "http://localhost:8080";
    window.location.href = `${apiBase}/oauth2/authorization/kakao`; // 카카오 로그인 페이지로 리디렉션
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-sm p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-center mb-4">로그인</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="spring.park@kakaobank.com"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            로그인
          </button>
        </form>
        <button
          onClick={() => navigate("/signup")}
          className="btn btn-success w-100 mt-3"
        >
          회원가입
        </button>
        <button
          onClick={handleKakaoLogin}
          className="btn btn-warning w-100 mt-3"
        >
          카카오로 로그인
        </button>
      </div>
    </div>
  );
}

export default Login;
