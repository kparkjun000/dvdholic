import React, { useState } from "react";
import axios from "../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (password1 !== password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 회원가입 API에 POST 요청
      const response = await axios.post("/api/v1/user/register", {
        username,
        password: password1,
        email,
        phone,
      });

      // 회원가입 성공 시 로그인 페이지로 이동
      if (response.data.success) {
        alert("회원가입이 완료되었습니다. 로그인해주세요.");
        navigate("/login"); // 로그인 페이지로 이동
      } else {
        alert("회원가입 실패: " + response.data.code);
      }
    } catch (error) {
      // 오류 처리
      console.error("register failed:", error);
      if (error.response && error.response.data) {
        alert(
          "회원가입 실패: " + (error.response.data.message || "알 수 없는 오류")
        );
      } else {
        alert("회원가입 실패: 서버 오류");
      }
    }
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
        <h3 className="text-center mb-4">회원가입</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password1" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              className="form-control"
              id="password1"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password2" className="form-label">
              비밀번호 확인
            </label>
            <input
              type="password"
              className="form-control"
              id="password2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              사용자 명
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자 이름"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              전화번호
            </label>
            <input
              type="text"
              className="form-control"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            회원가입
          </button>
        </form>
        <div className="text-center mt-3">
          <span style={{ color: "#666" }}>이미 계정이 있으신가요? </span>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-link p-0"
            style={{ textDecoration: "none", fontWeight: "500" }}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
