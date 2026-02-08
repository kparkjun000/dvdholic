import React, { useState } from "react";
import axios from "../axiosConfig";

function Dashboard() {
  const [page, setPage] = useState(0);
  const [movies, setMovies] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const getMovies = async (pageNum) => {
    console.log("========== 영화 조회 시작 ==========");
    console.log("요청 페이지:", pageNum);
    console.log("Token:", localStorage.getItem("token"));

    try {
      // Axios 인터셉터가 자동으로 토큰을 추가하므로 헤더 설정 불필요
      const response = await axios.post(`/api/v1/movie/search?page=${pageNum}`);

      console.log("전체 응답:", response);
      console.log("응답 데이터:", response.data);
      console.log("영화 데이터:", response.data.data);
      console.log("페이지 번호:", response.data.data.page);
      console.log("다음 페이지 있음:", response.data.data.hasNext);

      if (response.data.success && response.data.data.movies) {
        const movieData = response.data.data;
        setMovies(movieData.movies);
        setHasNext(movieData.hasNext);
        setPage(movieData.page);

        console.log("✅ 영화 데이터 설정 완료:", movieData.movies.length, "개");
        console.log("✅ 현재 페이지:", movieData.page);
        console.log("✅ 다음 페이지 여부:", movieData.hasNext);
      } else {
        console.log("영화 데이터가 없습니다.");
        setMovies([]);
      }
      console.log("========================================");
    } catch (error) {
      console.error("영화 조회 실패:", error);
      if (error.response) {
        console.error("에러 응답:", error.response.status, error.response.data);
      }
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      getMovies(prevPage);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = page + 1;
      setPage(nextPage);
      getMovies(nextPage);
    }
  };

  const like = async (movieName) => {
    try {
      const response = await axios.post(`/api/v1/movie/${movieName}/like`);
      console.log("좋아요 성공:", response);
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const unlike = async (movieName) => {
    try {
      const response = await axios.post(`/api/v1/movie/${movieName}/unlike`);
      console.log("싫어요 성공:", response);
    } catch (error) {
      console.error("싫어요 실패:", error);
    }
  };

  const download = async (movieName) => {
    try {
      const response = await axios.post(`/api/v1/movie/${movieName}/download`);
      console.log("다운로드 성공:", response);
    } catch (error) {
      console.error("다운로드 실패:", error);
    }
  };

  return (
    <div className="card shadow-sm p-4" style={{ width: "100%" }}>
      <h3 className="text-center mb-4">대시보드</h3>
      <p>여기는 대시보드입니다.</p>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => getMovies(0)}>
          영화 조회
        </button>
      </div>

      <div className="container mt-4">
        <h2 className="text-center mb-4">영화 데이터</h2>

        {/* 페이지네이션 - 상단 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-secondary"
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            ◀ 이전
          </button>
          <span
            className="badge bg-primary"
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            페이지: {page + 1}
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleNextPage}
            disabled={!hasNext}
          >
            다음 ▶
          </button>
        </div>

        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>영화 이름</th>
              <th>장르</th>
              <th>설명</th>
              <th>좋아요</th>
              <th>싫어요</th>
              <th>다운로드</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((item) => (
              <tr key={item.movieName}>
                <td>{item.movieName}</td>
                <td>{item.genre}</td>
                <td>{item.overview}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => like(item.movieName)}
                  >
                    👍 좋아요
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => unlike(item.movieName)}
                  >
                    👎 싫어요
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => download(item.movieName)}
                  >
                    📥 다운로드
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 - 하단 */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            ◀ 이전
          </button>
          <span
            className="badge bg-primary"
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            페이지: {page + 1}{" "}
            {hasNext ? "(다음 페이지 있음)" : "(마지막 페이지)"}
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleNextPage}
            disabled={!hasNext}
          >
            다음 ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
