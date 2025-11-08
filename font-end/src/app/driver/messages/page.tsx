'use client';

import React, { useEffect, useState, useRef } from 'react';
import ConversationList from '@/components/ConversationList';
import MessageInput from '@/components/MessageInput';
import { useSocket } from '@/context/SocketContext';

interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface Contact {
  user_id: number;
  full_name: string;
  email?: string;
  avatar_url?: string;
  unread_count?: number;
}

const DriverMessagesPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { joinConversation, leaveConversation, onNewMessage } = useSocket();

  useEffect(() => {
    fetchContacts();

    const cleanup = onNewMessage((data) => {
      if (selectedContact && data.conversation_id === selectedContact.user_id) {
        setMessages((m) => [...m, {
          message_id: Date.now(),
          sender_id: data.sender_id,
          receiver_id: -1,
          content: data.message_text,
          created_at: data.timestamp,
          sender_name: data.sender_name
        }] as Message[]);
      } else {
        fetchContacts();
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [selectedContact, onNewMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/messages/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.data || data);
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  };

  const fetchConversation = async (otherUserId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || data);
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (id: number) => {
    const contact = contacts.find((c) => c.user_id === id) || null;
    if (!contact) return;

    if (selectedContact) {
      try { leaveConversation(selectedContact.user_id); } catch (e) { }
    }

    setSelectedContact(contact);
    fetchConversation(contact.user_id);

    try { joinConversation(contact.user_id); } catch (e) { }

    // mark as read
    markConversationRead(contact.user_id);
  };

  const markConversationRead = async (otherUserId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${otherUserId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (err) {}
  };

  const handleMessageSent = (savedMsg: any) => {
    setMessages((m) => [...m, savedMsg.data || savedMsg]);
    fetchContacts();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin nhắn</h1>
          <p className="text-gray-600">Giao tiếp với phụ huynh và admin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ConversationList contacts={contacts} selectedId={selectedContact?.user_id || null} onSelect={handleSelectContact} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-[70vh]">
              {selectedContact ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{selectedContact.full_name}</h2>
                    <p className="text-sm text-gray-500">{selectedContact.email}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 border rounded-md">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 p-6">Không có tin nhắn</div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.message_id || m.created_at} className={`p-2 my-2 max-w-[70%] ${m.sender_id === (localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId') as string) : -1) ? 'ml-auto bg-blue-50 text-right' : 'bg-gray-100' } rounded-lg`}>
                          <div className="text-sm text-gray-800">{m.content}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="mt-4">
                    <MessageInput otherUserId={selectedContact.user_id} onMessageSent={handleMessageSent} />
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-500">Chọn một liên hệ để bắt đầu trò chuyện</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMessagesPage;
