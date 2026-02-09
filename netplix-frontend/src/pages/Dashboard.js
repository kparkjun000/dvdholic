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

  // 깨진 한글을 감지하는 함수 (CJK 한자가 포함되어 있으면 깨진 것으로 판단)
  const isCorruptedKorean = (text) => {
    if (!text) return false;
    // CJK Unified Ideographs 범위 (U+4E00 ~ U+9FFF)
    // 정상적인 한글 설명에는 중국 한자가 없어야 함
    const cjkPattern = /[\u4E00-\u9FFF]/;
    return cjkPattern.test(text);
  };

  // 설명 텍스트를 표시하는 함수
  const getDisplayOverview = (overview) => {
    if (overview === "No description available.") {
      return "설명이 제공되지 않습니다.";
    }
    if (isCorruptedKorean(overview)) {
      return "설명이 제공되지 않습니다.";
    }
    return overview;
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#141414",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "'D2Coding', monospace",
      }}
    >
      <h3
        className="text-center mb-4"
        style={{
          color: "#E50914",
          fontWeight: "bold",
          fontSize: "2.5rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        HOLIC
      </h3>

      <div className="mb-4 text-center">
        <button
          onClick={() => getMovies(0)}
          style={{
            backgroundColor: "#E50914",
            color: "white",
            border: "none",
            padding: "15px 40px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(229, 9, 20, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#B20710";
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 12px rgba(229, 9, 20, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#E50914";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(229, 9, 20, 0.3)";
          }}
        >
          🎬 영화 조회
        </button>
      </div>

      <div className="container mt-4">
        <h2
          className="text-center mb-4"
          style={{ color: "#ffffff", fontWeight: "bold", fontSize: "1.8rem" }}
        >
          인기 영화
        </h2>

        {/* 페이지네이션 - 상단 */}
        <div
          className="d-flex justify-content-center align-items-center mb-3"
          style={{ gap: "15px" }}
        >
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            style={{
              backgroundColor: page === 0 ? "#555" : "#E50914",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: page === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (page !== 0) e.target.style.backgroundColor = "#B20710";
            }}
            onMouseLeave={(e) => {
              if (page !== 0) e.target.style.backgroundColor = "#E50914";
            }}
          >
            ← 이전
          </button>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffffff",
              padding: "8px 20px",
              backgroundColor: "#2a2a2a",
              border: "2px solid #E50914",
              borderRadius: "5px",
              minWidth: "100px",
              textAlign: "center",
            }}
          >
            {page + 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNext}
            style={{
              backgroundColor: !hasNext ? "#555" : "#E50914",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: !hasNext ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (hasNext) e.target.style.backgroundColor = "#B20710";
            }}
            onMouseLeave={(e) => {
              if (hasNext) e.target.style.backgroundColor = "#E50914";
            }}
          >
            다음 →
          </button>
        </div>

        <table
          style={{
            width: "100%",
            backgroundColor: "#141414",
            border: "none",
            borderCollapse: "separate",
            borderSpacing: "0 10px",
          }}
        >
          <thead
            style={{
              backgroundColor: "#000000",
              color: "white",
              border: "none",
              outline: "none",
            }}
          >
            <tr style={{ border: "none", outline: "none" }}>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                }}
              >
                영화 이름
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                }}
              >
                장르
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                }}
              >
                설명
              </th>
              <th
                style={{
                  width: "60px",
                  padding: "15px",
                  border: "none",
                  outline: "none",
                }}
              ></th>
              <th
                style={{
                  width: "60px",
                  padding: "15px",
                  border: "none",
                  outline: "none",
                }}
              ></th>
              <th
                style={{
                  width: "60px",
                  padding: "15px",
                  border: "none",
                  outline: "none",
                }}
              ></th>
              <th
                style={{
                  width: "60px",
                  padding: "15px",
                  border: "none",
                  outline: "none",
                }}
              ></th>
            </tr>
          </thead>
          <tbody style={{ border: "none", outline: "none" }}>
            {movies.map((item, index) => (
              <tr
                key={item.movieName}
                style={{
                  backgroundColor: "#1f1f1f",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "none",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2a2a2a";
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.border = "none";
                  e.currentTarget.style.outline = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1f1f1f";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.border = "none";
                  e.currentTarget.style.outline = "none";
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    fontWeight: "500",
                    color: "#ffffff",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                    verticalAlign: "middle",
                    boxShadow: "none",
                  }}
                >
                  {item.movieName}
                </td>
                <td
                  style={{
                    padding: "15px",
                    color: "#b3b3b3",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {item.genre}
                </td>
                <td
                  style={{
                    padding: "15px",
                    color: "#999999",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {getDisplayOverview(item.overview)}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    border: "none",
                    outline: "none",
                    verticalAlign: "middle",
                    backgroundColor: "transparent",
                  }}
                >
                  {item.posterPath ? (
                    <a
                      href={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ border: "none", background: "none" }}
                    >
                      <img
                        src="https://img.icons8.com/fluency/48/gallery.png"
                        alt="이미지 보기"
                        style={{
                          width: "32px",
                          height: "32px",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.transform = "scale(1.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.transform = "scale(1)")
                        }
                      />
                    </a>
                  ) : (
                    <img
                      src="https://img.icons8.com/fluency/48/gallery.png"
                      alt="이미지 없음"
                      style={{
                        width: "32px",
                        height: "32px",
                        opacity: "0.3",
                        cursor: "not-allowed",
                      }}
                    />
                  )}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    border: "none",
                    outline: "none",
                    verticalAlign: "middle",
                  }}
                >
                  <button
                    className="btn btn-link p-0"
                    onClick={() => like(item.movieName)}
                    style={{ border: "none", background: "none" }}
                  >
                    <img
                      src="https://img.icons8.com/fluency/48/like.png"
                      alt="좋아요"
                      style={{
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </button>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    border: "none",
                    outline: "none",
                    verticalAlign: "middle",
                  }}
                >
                  <button
                    className="btn btn-link p-0"
                    onClick={() => unlike(item.movieName)}
                    style={{ border: "none", background: "none" }}
                  >
                    <img
                      src="https://img.icons8.com/fluency/48/dislike.png"
                      alt="싫어요"
                      style={{
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </button>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    border: "none",
                    outline: "none",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                    verticalAlign: "middle",
                  }}
                >
                  <button
                    className="btn btn-link p-0"
                    onClick={() => download(item.movieName)}
                    style={{ border: "none", background: "none" }}
                  >
                    <img
                      src="https://img.icons8.com/fluency/48/download-from-cloud.png"
                      alt="다운로드"
                      style={{
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 - 하단 */}
        <div
          className="d-flex justify-content-center align-items-center mt-3"
          style={{ gap: "15px" }}
        >
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            style={{
              backgroundColor: page === 0 ? "#555" : "#E50914",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: page === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (page !== 0) e.target.style.backgroundColor = "#B20710";
            }}
            onMouseLeave={(e) => {
              if (page !== 0) e.target.style.backgroundColor = "#E50914";
            }}
          >
            ← 이전
          </button>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffffff",
              padding: "8px 20px",
              backgroundColor: "#2a2a2a",
              border: "2px solid #E50914",
              borderRadius: "5px",
              minWidth: "100px",
              textAlign: "center",
            }}
          >
            {page + 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNext}
            style={{
              backgroundColor: !hasNext ? "#555" : "#E50914",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: !hasNext ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (hasNext) e.target.style.backgroundColor = "#B20710";
            }}
            onMouseLeave={(e) => {
              if (hasNext) e.target.style.backgroundColor = "#E50914";
            }}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
