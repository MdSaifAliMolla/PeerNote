import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const style: React.CSSProperties = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '4px',
        color: '#fff',
        backgroundColor: type === 'success' ? '#4CAF50' : '#F44336',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'fadeIn 0.5s, fadeOut 0.5s 2.5s',
    };

    return <div style={style}>{message}</div>;
};

export default Toast;
