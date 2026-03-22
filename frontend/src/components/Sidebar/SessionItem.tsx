import { useEffect, useRef, useState } from 'react';

import type { Session } from '../../types';
import { useSessionStore } from '../../stores/sessionStore';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
}

export function SessionItem({ session, isActive, onSelect }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { renameSession, deleteSession } = useSessionStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleRename = () => {
    if (editTitle.trim()) {
      renameSession(session.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleRename();
    } else if (event.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-fast
        ${isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary border border-transparent'}
      `}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(event) => setEditTitle(event.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-primary outline-none text-sm text-text-primary"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <>
          <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="flex-1 truncate text-sm">{session.title}</span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface-border transition-all"
            onClick={(event) => {
              event.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-2 bg-bg-elevated border border-surface-border rounded-xl shadow-xl py-2 z-10 min-w-[140px] overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-all flex items-center gap-2"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-status-error hover:bg-status-error/10 transition-all flex items-center gap-2"
                onClick={() => {
                  deleteSession(session.id);
                  setShowMenu(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
