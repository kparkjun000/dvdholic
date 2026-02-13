import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function KakaoAuthRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get('code');

        if (code) {
            axios
                .post('/api/v1/auth/callback', { code })
                .then((response) => {
                    const data = response.data?.data;
                    if (data?.accessToken) {
                        localStorage.setItem('token', data.accessToken);
                        if (data.refreshToken) {
                            localStorage.setItem('refresh_token', data.refreshToken);
                        }
                    }
                    navigate('/dashboard', { replace: true });
                })
                .catch((error) => {
                    console.error('카카오 로그인 실패:', error);
                    navigate('/login', { replace: true });
                });
        } else {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#141414',
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#E50914',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default KakaoAuthRedirect;