'use client';

import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';

interface MessageInputProps {
  otherUserId: number;
  onMessageSent?: (msg: any) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ otherUserId, onMessageSent }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { sendMessage } = useSocket();

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);

    try {
      const token = localStorage.getItem('token');

      // Persist message via API
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: otherUserId, content: text })
      });

      if (res.ok) {
        const saved = await res.json();

        // Emit socket message to conversation room for real-time
        try {
          sendMessage(otherUserId, text);
        } catch (err) {
          // socket might fail; ignore to avoid blocking
          console.warn('Socket send failed', err);
        }

        setText('');
        onMessageSent && onMessageSent(saved.data || saved);
      } else {
        const err = await res.json();
        console.error('Send message failed', err);
        alert(err.message || 'Gửi tin nhắn thất bại');
      }
    } catch (error) {
      console.error('Error sending message', error);
      alert('Có lỗi khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-md p-3 resize-none h-24"
        />
        <div className="w-32 flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-60"
          >
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
