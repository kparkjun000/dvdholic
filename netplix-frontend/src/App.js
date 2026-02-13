import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useLocation,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Main from "./pages/Main";
import KakaoAuthRedirect from "./pages/KakaoAuthRedirect";
import "./axiosConfig"; // Axios 인터셉터 설정

/** 카카오 로그인 리다이렉트 시 URL의 token을 먼저 저장한 뒤 대시보드 표시 (ProtectedRoute보다 먼저 토큰 처리) */
function DashboardRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const refreshFromUrl = searchParams.get("refresh_token");

  if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    if (refreshFromUrl) localStorage.setItem("refresh_token", refreshFromUrl);
  }

  useEffect(() => {
    if (searchParams.get("token")) {
      setSearchParams({});
      window.dispatchEvent(new CustomEvent("token-stored"));
    }
  }, [searchParams, setSearchParams]);

  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;
  return <Dashboard />;
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const location = useLocation();

  // 경로 변경 시(카카오 로그인 후 /dashboard 이동 포함) 토큰 재확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // 카카오 OAuth2 리다이렉트 후 Dashboard에서 토큰 저장 시 로그인 상태 갱신
  useEffect(() => {
    const onTokenStored = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("token-stored", onTokenStored);
    return () => window.removeEventListener("token-stored", onTokenStored);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // 로컬 스토리지에서 토큰 삭제
      localStorage.removeItem("token");
      // 로그인 페이지로 리디렉션
      setIsLoggedIn(false);
    } catch (error) {
      alert("로그아웃 실패");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url(/d.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* 상단 네비게이션 바 */}
      <nav
        style={{
          backgroundColor: "transparent",
          padding: "15px 0",
          border: "none",
          boxShadow: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 40px",
            margin: 0,
          }}
        >
          {/* 왼쪽 - 로고 */}
          <Link
            className="navbar-brand"
            to="/"
            onClick={(e) => {
              // 로그인 또는 회원가입 페이지에서는 클릭 방지
              if (
                location.pathname === "/login" ||
                location.pathname === "/signup"
              ) {
                e.preventDefault();
              }
            }}
            style={{
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              lineHeight: "40px",
              cursor:
                location.pathname === "/login" ||
                location.pathname === "/signup"
                  ? "default"
                  : "pointer",
              flex: "0 0 auto",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#E50914",
                lineHeight: "40px",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              MOVIE+
            </span>
            <img
              src="/icons8-dvd-logo-100.png"
              alt="DVD Logo"
              style={{
                width: "40px",
                height: "40px",
                verticalAlign: "middle",
              }}
            />
            <span style={{ lineHeight: "40px" }}>Holic</span>
            <img
              src="/snake-icon2.gif"
              alt="Snake Icon"
              style={{
                width: "35px",
                height: "35px",
                objectFit: "contain",
                backgroundColor: "transparent",
                mixBlendMode: "screen",
                verticalAlign: "middle",
              }}
            />
          </Link>

          {/* 가운데 - 업데이트 안내 */}
          {location.pathname === "/dashboard" && (
            <div
              style={{
                flex: "1 1 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#ff0000",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textShadow:
                    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 3px 3px 6px rgba(0,0,0,0.9)",
                  WebkitTextStroke: "1px #000",
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                HOT🔥 최신 MOVIE+ DVD 매일 자동 업데이트!! (새벽 2시)
              </span>
            </div>
          )}

          {/* 오른쪽 - 로그인/로그아웃 */}
          <div style={{ flex: "0 0 auto" }}>
            <ul
              style={{
                display: "flex",
                flexDirection: "row",
                listStyle: "none",
                margin: 0,
                padding: 0,
                gap: "20px",
                alignItems: "center",
              }}
            >
              {!isLoggedIn ||
              location.pathname === "/login" ||
              location.pathname === "/signup" ? (
                <>
                  {location.pathname !== "/login" && (
                    <li>
                      <Link
                        to="/login"
                        style={{
                          color: "#ffffff",
                          fontWeight: "500",
                          fontSize: "16px",
                          textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                          textDecoration: "none",
                        }}
                      >
                        로그인
                      </Link>
                    </li>
                  )}
                  {location.pathname !== "/signup" && (
                    <li>
                      <Link
                        to="/signup"
                        style={{
                          color: "#ffffff",
                          fontWeight: "500",
                          fontSize: "16px",
                          textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                          textDecoration: "none",
                        }}
                      >
                        회원가입
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <button
                      className="btn btn-danger"
                      onClick={handleLogout}
                      style={{
                        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        fontWeight: "600",
                      }}
                    >
                      로그아웃
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* 페이지 라우팅 */}
      <div style={{ width: "100%", margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login/oauth2/code/kakao"
            element={<KakaoAuthRedirect />}
          />

          <Route path="/dashboard" element={<DashboardRoute />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
