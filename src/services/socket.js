/**
 * Socket.IO Service - Real-time notifications
 */
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    // Connect to Socket.IO server
    connect(userId) {
        if (this.socket?.connected) {
            return;
        }

        const token = localStorage.getItem('access_token');
        
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('🔌 Socket.IO connected');
            // Join user's notification room
            this.socket.emit('join', { user_id: userId });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket.IO disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        // Setup default listeners
        this.setupDefaultListeners();
    }

    // Disconnect from server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Setup default event listeners
    setupDefaultListeners() {
        // Inference status updates
        this.socket.on('inference_status', (data) => {
            console.log('📊 Inference status:', data);
            this.notifyListeners('inference_status', data);
        });

        // Inference completed
        this.socket.on('inference_completed', (data) => {
            console.log('✅ Inference completed:', data);
            this.notifyListeners('inference_completed', data);
        });

        // Inference failed
        this.socket.on('inference_failed', (data) => {
            console.log('❌ Inference failed:', data);
            this.notifyListeners('inference_failed', data);
        });

        // General notifications
        this.socket.on('notification', (data) => {
            console.log('🔔 Notification:', data);
            this.notifyListeners('notification', data);
        });
    }

    // Add event listener
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return cleanup function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    // Remove event listener
    off(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    // Notify all listeners for an event
    notifyListeners(event, data) {
        this.listeners.get(event)?.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Socket listener error:', error);
            }
        });
    }

    // Emit event to server
    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
