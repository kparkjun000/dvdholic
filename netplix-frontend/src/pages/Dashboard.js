import React, { useState } from "react";
import axios from "../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
  const [page, setPage] = useState(0);
  const [movies, setMovies] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [imageTabStates, setImageTabStates] = useState({}); // 각 영화별 이미지 탭 상태
  const [likeCount, setLikeCount] = useState(0); // 현재 영화의 좋아요 개수
  const [unlikeCount, setUnlikeCount] = useState(0); // 현재 영화의 싫어요 개수
  const [contentType, setContentType] = useState("dvd"); // "dvd" 또는 "movie"
  const [listError, setListError] = useState(null); // 목록 로드 실패 시 메시지

  const getMovies = async (pageNum) => {
    setListError(null);
    try {
      const response = await axios.post(`/api/v1/movie/search?page=${pageNum}`);
      const data = response.data?.data;
      if (response.data?.success && data && Array.isArray(data.movies)) {
        setMovies(data.movies);
        setHasNext(Boolean(data.hasNext));
        setPage(pageNum);
      } else {
        setMovies([]);
        setHasNext(false);
      }
    } catch (error) {
      console.error("영화 조회 실패:", error);
      setMovies([]);
      setHasNext(false);
      setListError(
        error.response?.status === 401
          ? "목록을 보려면 로그인할 필요는 없지만, 서버 연결에 실패했을 수 있습니다."
          : "DVD 목록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  const getPlayingMovies = async (pageNum) => {
    setListError(null);
    try {
      const response = await axios.post(`/api/v1/movie/playing/search?page=${pageNum}`);
      const data = response.data?.data;
      if (response.data?.success && data && Array.isArray(data.movies)) {
        setMovies(data.movies);
        setHasNext(Boolean(data.hasNext));
        setPage(pageNum);
      } else {
        setMovies([]);
        setHasNext(false);
      }
    } catch (error) {
      console.error("영화 정보 조회 실패:", error);
      setMovies([]);
      setHasNext(false);
      setListError(
        error.response?.status === 401
          ? "목록을 보려면 로그인할 필요는 없지만, 서버 연결에 실패했을 수 있습니다."
          : "영화 목록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      if (contentType === "dvd") {
        getMovies(prevPage);
      } else {
        getPlayingMovies(prevPage);
      }
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = page + 1;
      setPage(nextPage);
      if (contentType === "dvd") {
        getMovies(nextPage);
      } else {
        getPlayingMovies(nextPage);
      }
    }
  };

  const getLikeCount = async (movieName) => {
    try {
      const response = await axios.get(`/api/v1/movie/${movieName}/like-count`);
      if (response.data.success) {
        setLikeCount(response.data.data);
        console.log("좋아요 개수:", response.data.data);
      }
    } catch (error) {
      console.error("좋아요 개수 조회 실패:", error);
      setLikeCount(0);
    }
  };

  const getUnlikeCount = async (movieName) => {
    try {
      const response = await axios.get(`/api/v1/movie/${movieName}/unlike-count`);
      if (response.data.success) {
        setUnlikeCount(response.data.data);
        console.log("싫어요 개수:", response.data.data);
      }
    } catch (error) {
      console.error("싫어요 개수 조회 실패:", error);
      setUnlikeCount(0);
    }
  };

  const like = async (movieName) => {
    try {
      const response = await axios.post(`/api/v1/movie/${movieName}/like`);
      console.log("좋아요 성공:", response);
      // 좋아요 후 개수 갱신
      await getLikeCount(movieName);
      await getUnlikeCount(movieName);
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const unlike = async (movieName) => {
    try {
      const response = await axios.post(`/api/v1/movie/${movieName}/unlike`);
      console.log("싫어요 성공:", response);
      // 싫어요 후 개수 갱신
      await getLikeCount(movieName);
      await getUnlikeCount(movieName);
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

  // 상세 정보 모달 열기
  const openDetailModal = async (movie) => {
    setCurrentMovie(movie);
    setShowDetailModal(true);
    // 좋아요, 싫어요 개수 조회
    await getLikeCount(movie.movieName);
    await getUnlikeCount(movie.movieName);
  };

  // 상세 정보 모달 닫기
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setCurrentMovie(null);
    setLikeCount(0);
    setUnlikeCount(0);
  };

  // 이미지 탭 전환
  const toggleImageTab = (movieName, tab) => {
    setImageTabStates((prev) => ({
      ...prev,
      [movieName]: tab,
    }));
  };

  // 현재 활성화된 이미지 탭 가져오기
  const getActiveTab = (movieName) => {
    return imageTabStates[movieName] || "poster";
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
    const noDescMessage = contentType === "movie" 
      ? "이 영화, 말이 없네요 🤐" 
      : "이 DVD, 말이 없네요 🤐";
    
    // overview가 없거나 비어있는 경우
    if (!overview || overview.trim() === "") {
      return noDescMessage;
    }
    if (overview === "No description available.") {
      return noDescMessage;
    }
    if (isCorruptedKorean(overview)) {
      return noDescMessage;
    }
    return overview;
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#141414",
        minHeight: "100vh",
        padding: "15px 10px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <div className="mb-3 text-center" style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <button
          onClick={() => {
            setContentType("movie");
            setPage(0);
            getPlayingMovies(0);
          }}
          style={{
            backgroundColor: contentType === "movie" ? "#CC4400" : "#FF5722",
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(255, 87, 34, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#CC4400";
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 12px rgba(255, 87, 34, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = contentType === "movie" ? "#CC4400" : "#FF5722";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(255, 87, 34, 0.3)";
          }}
        >
          Popular MOVIE Select
        </button>
        <button
          onClick={() => {
            setContentType("dvd");
            setPage(0);
            getMovies(0);
          }}
          style={{
            backgroundColor: contentType === "dvd" ? "#B20710" : "#E50914",
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
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
            e.target.style.backgroundColor = contentType === "dvd" ? "#B20710" : "#E50914";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(229, 9, 20, 0.3)";
          }}
        >
          Popular DVD Select
        </button>
      </div>

      <div style={{ width: "100%", padding: "0 5px" }}>
        {listError && (
          <div
            className="mb-3 p-3 rounded"
            style={{
              backgroundColor: "rgba(229, 9, 20, 0.15)",
              border: "1px solid #E50914",
              color: "#f5f5f5",
              textAlign: "center",
            }}
          >
            {listError}
          </div>
        )}
        {/* 페이지네이션 - 상단 (영화 데이터가 있을 때만 표시) */}
        {movies.length > 0 && (
          <div
            className="d-flex justify-content-center align-items-center mb-3"
            style={{ gap: "10px" }}
          >
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              style={{
                backgroundColor: page === 0 ? "#555" : "#E50914",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: page === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
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
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                padding: "6px 16px",
                backgroundColor: "#2a2a2a",
                border: "2px solid #E50914",
                borderRadius: "5px",
                minWidth: "70px",
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
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: !hasNext ? "not-allowed" : "pointer",
                fontSize: "14px",
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
        )}

        {/* 모바일 카드 레이아웃 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          {movies.map((item, index) => {
            const activeTab = getActiveTab(item.movieName);
            const currentImagePath =
              activeTab === "poster" ? item.posterPath : item.backdropPath;
            const hasBothImages = item.posterPath && item.backdropPath; // 둘 다 있는지 확인

            return (
              <div
                key={item.movieName}
                style={{
                  backgroundColor: "#1f1f1f",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Bootstrap Tabs와 이미지 영역 */}
                <div style={{ position: "relative" }}>
                  {/* Bootstrap Nav Tabs */}
                  <ul
                    className="nav nav-tabs"
                    style={{
                      borderBottom: "2px solid #E50914",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      margin: 0,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.posterPath && (
                      <li className="nav-item">
                        <button
                          className={`nav-link ${
                            activeTab === "poster" ? "active" : ""
                          }`}
                          onClick={() =>
                            hasBothImages &&
                            toggleImageTab(item.movieName, "poster")
                          }
                          style={{
                            color: activeTab === "poster" ? "#fff" : "#b3b3b3",
                            backgroundColor:
                              activeTab === "poster"
                                ? "#E50914"
                                : "transparent",
                            border: "none",
                            borderRadius: "0",
                            padding: "10px 20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            cursor: hasBothImages ? "pointer" : "default",
                            opacity: hasBothImages ? 1 : 0.7,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <img
                            src="https://img.icons8.com/fluency/24/clapperboard.png"
                            alt="poster"
                            style={{ width: "18px", height: "18px" }}
                          />
                          포스터
                        </button>
                      </li>
                    )}
                    {item.backdropPath && (
                      <li className="nav-item">
                        <button
                          className={`nav-link ${
                            activeTab === "backdrop" ? "active" : ""
                          }`}
                          onClick={() =>
                            hasBothImages &&
                            toggleImageTab(item.movieName, "backdrop")
                          }
                          style={{
                            color:
                              activeTab === "backdrop" ? "#fff" : "#b3b3b3",
                            backgroundColor:
                              activeTab === "backdrop"
                                ? "#E50914"
                                : "transparent",
                            border: "none",
                            borderRadius: "0",
                            padding: "10px 20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            cursor: hasBothImages ? "pointer" : "default",
                            opacity: hasBothImages ? 1 : 0.7,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <img
                            src="https://img.icons8.com/fluency/24/image.png"
                            alt="backdrop"
                            style={{ width: "18px", height: "18px" }}
                          />
                          배경
                        </button>
                      </li>
                    )}
                  </ul>

                  {/* Tab Content - 이미지 표시 */}
                  <div
                    className="tab-content"
                    style={{
                      backgroundColor: "#000",
                      cursor: "pointer",
                    }}
                    onClick={() => openDetailModal(item)}
                  >
                    <div className="tab-pane fade show active">
                      {currentImagePath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/original${currentImagePath}`}
                          alt={item.movieName}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            minHeight: "200px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 - 하단 (영화 데이터가 있을 때만 표시) */}
        {movies.length > 0 && (
          <div
            className="d-flex justify-content-center align-items-center mt-3"
            style={{ gap: "10px" }}
          >
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              style={{
                backgroundColor: page === 0 ? "#555" : "#E50914",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: page === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
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
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                padding: "6px 16px",
                backgroundColor: "#2a2a2a",
                border: "2px solid #E50914",
                borderRadius: "5px",
                minWidth: "70px",
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
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: !hasNext ? "not-allowed" : "pointer",
                fontSize: "14px",
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
        )}
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && currentMovie && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "40px 20px",
          }}
          onClick={closeDetailModal}
        >
          <div
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "400px",
              maxHeight: "90vh",
              backgroundColor: "#1f1f1f",
              borderRadius: "8px",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={closeDetailModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "2px",
                backgroundColor: "#555",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              닫기
            </button>

            {/* 영화 제목 */}
            <div
              style={{
                padding: "20px 15px 15px 15px",
                backgroundColor: "#000",
                color: "#fff",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {currentMovie.movieName}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#b3b3b3",
                }}
              >
                {currentMovie.genre}
              </div>
            </div>

            {/* 설명 */}
            <div
              style={{
                padding: "15px",
                color: "#ffffff",
                fontSize: "13px",
                lineHeight: "1.6",
                borderBottom: "1px solid #333",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                textAlign: "center",
              }}
            >
              {getDisplayOverview(currentMovie.overview)}
            </div>

            {/* 상세 정보 */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "#0f0f0f",
                borderBottom: "1px solid #333",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                {currentMovie.voteAverage && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: "20px",
                          fontWeight: "bold",
                          minWidth: "60px",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        }}
                      >
                        ⭐ 평점
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "20px",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          fontWeight: "300",
                          letterSpacing: "0.5px",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {currentMovie.voteAverage.toFixed(1)} / 10
                      </span>
                    </div>
                    {/* 평점 막대그래프 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "0 15px",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          height: "8px",
                          backgroundColor: "#333",
                          borderRadius: "4px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: `${(currentMovie.voteAverage / 10) * 100}%`,
                            height: "100%",
                            backgroundColor:
                              currentMovie.voteAverage >= 7
                                ? "#4CAF50"
                                : currentMovie.voteAverage >= 5
                                ? "#FFC107"
                                : "#F44336",
                            borderRadius: "4px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {currentMovie.releaseDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                      }}
                    >
                      📅 {contentType === "movie" ? "개봉일" : "출시일"}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentMovie.releaseDate}
                    </span>
                  </div>
                )}
                {currentMovie.runtime && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                      }}
                    >
                      ⏱️ {contentType === "movie" ? "상영" : "러닝타임"}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentMovie.runtime}분
                    </span>
                  </div>
                )}
                {currentMovie.genre && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        whiteSpace: "nowrap",
                        letterSpacing: "0",
                      }}
                    >
                      🎭 장르
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {currentMovie.genre}
                    </span>
                  </div>
                )}
                {currentMovie.director && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                      }}
                    >
                      🎬 감독
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentMovie.director}
                    </span>
                  </div>
                )}
                {currentMovie.cast && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "27px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        whiteSpace: "nowrap",
                        letterSpacing: "0",
                      }}
                    >
                      🎭 출연
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        lineHeight: "1.5",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentMovie.cast}
                    </span>
                  </div>
                )}
                {currentMovie.certification && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      width: "100%",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        minWidth: "60px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                      }}
                    >
                      🔞 등급
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                        fontWeight: "300",
                        letterSpacing: "0.5px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentMovie.certification}
                    </span>
                  </div>
                )}
                {(currentMovie.budget || currentMovie.revenue) && (
                  <>
                    {currentMovie.budget && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          💰 예산
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "20px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                            letterSpacing: "0.5px",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${(currentMovie.budget / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}
                    {currentMovie.revenue && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          💵 수익
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "20px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                            letterSpacing: "0.5px",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${(currentMovie.revenue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}

                    {/* 예고편 */}
                    {currentMovie.trailerUrl && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          🎬 예고편
                        </span>
                        <a
                          href={currentMovie.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#FF5722",
                            fontSize: "18px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                        >
                          YouTube 보기 ▶
                        </a>
                      </div>
                    )}

                    {/* OTT 제공 플랫폼 */}
                    {currentMovie.ottProviders && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          📺 시청 가능
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "18px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                          }}
                        >
                          {currentMovie.ottProviders}
                        </span>
                      </div>
                    )}

                    {/* 시리즈/컬렉션 정보 */}
                    {currentMovie.collection && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          🎞️ 시리즈
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "18px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                          }}
                        >
                          {currentMovie.collection}
                        </span>
                      </div>
                    )}

                    {/* 추천 영화 */}
                    {currentMovie.recommendations && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          width: "100%",
                          alignSelf: "stretch",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "20px",
                            fontWeight: "bold",
                            minWidth: "60px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            whiteSpace: "nowrap",
                            letterSpacing: "0",
                          }}
                        >
                          💡 추천
                        </span>
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "16px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                            lineHeight: "1.4",
                          }}
                        >
                          {currentMovie.recommendations}
                        </span>
                      </div>
                    )}

                    {/* 대표 리뷰 */}
                    {currentMovie.topReview && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          width: "100%",
                          alignSelf: "stretch",
                          padding: "15px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          borderLeft: "3px solid #FF5722",
                        }}
                      >
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "18px",
                            fontWeight: "bold",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                          }}
                        >
                          ⭐ 관객 리뷰
                        </span>
                        <span
                          style={{
                            color: "#ddd",
                            fontSize: "15px",
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                            fontWeight: "300",
                            lineHeight: "1.6",
                            fontStyle: "italic",
                          }}
                        >
                          "{currentMovie.topReview}"
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 아이콘 버튼들 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-start",
                padding: "20px",
                gap: "15px",
              }}
            >
              {/* 좋아요 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <button
                  onClick={() => {
                    like(currentMovie.movieName);
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="https://img.icons8.com/emoji/96/red-heart.png"
                    alt="좋아요"
                    style={{
                      width: "50px",
                      height: "50px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      objectFit: "contain",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.2)")
                    }
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  />
                </button>
              </div>

              {/* 싫어요 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <button
                  onClick={() => {
                    unlike(currentMovie.movieName);
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="https://img.icons8.com/fluency/96/thumbs-down.png"
                    alt="싫어요"
                    style={{
                      width: "50px",
                      height: "50px",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      objectFit: "contain",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.2)")
                    }
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  />
                </button>
              </div>

              {/* 좋아요/싫어요 비율 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* 좋아요 막대 (빨강) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "bold",
                      minWidth: "30px",
                      textAlign: "right",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                    }}
                  >
                    👍
                  </span>
                  <div
                    style={{
                      width: "80px",
                      height: "12px",
                      backgroundColor: "#333",
                      borderRadius: "6px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${
                          likeCount + unlikeCount > 0
                            ? (likeCount / (likeCount + unlikeCount)) * 100
                            : 50
                        }%`,
                        height: "100%",
                        backgroundColor: "#ff0000",
                        borderRadius: "6px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "bold",
                      minWidth: "25px",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                    }}
                  >
                    {likeCount}
                  </span>
                </div>

                {/* 싫어요 막대 (노랑) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "bold",
                      minWidth: "30px",
                      textAlign: "right",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                    }}
                  >
                    👎
                  </span>
                  <div
                    style={{
                      width: "80px",
                      height: "12px",
                      backgroundColor: "#333",
                      borderRadius: "6px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${
                          likeCount + unlikeCount > 0
                            ? (unlikeCount / (likeCount + unlikeCount)) * 100
                            : 50
                        }%`,
                        height: "100%",
                        backgroundColor: "#FFC107",
                        borderRadius: "6px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "bold",
                      minWidth: "25px",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
                    }}
                  >
                    {unlikeCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
