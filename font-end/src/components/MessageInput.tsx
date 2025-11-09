'use client';

import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';

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
      const res = await api.post('/api/messages', {
        receiver_id: otherUserId,
        content: text
      });

      try {
        sendMessage(otherUserId, text);
      } catch (err) {
        console.warn('Socket send failed', err);
      }

      setText('');
      onMessageSent && onMessageSent(res.data.data || res.data);
    } catch (error: any) {
      console.error('Error sending message', error);
      alert(error.response?.data?.message || 'Có lỗi khi gửi tin nhắn');
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
