'use client';

import React from 'react';

interface Contact {
  user_id: number;
  full_name: string;
  email?: string;
  avatar_url?: string;
  unread_count?: number;
}

interface Props {
  contacts: Contact[];
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

const ConversationList: React.FC<Props> = ({ contacts, selectedId, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Liên hệ</h3>
      </div>
      <div className="divide-y">
        {contacts.map((c) => (
          <div
            key={c.user_id}
            onClick={() => onSelect(c.user_id)}
            className={`p-4 cursor-pointer flex items-center gap-3 ${selectedId === c.user_id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              {c.full_name.split(' ').slice(-1)[0][0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{c.full_name}</div>
                {c.unread_count ? (
                  <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{c.unread_count}</div>
                ) : null}
              </div>
              <div className="text-xs text-gray-500">{c.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
