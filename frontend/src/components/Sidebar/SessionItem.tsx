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
      className={
        `group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ` +
        `transition-colors duration-150 ` +
        (isActive
          ? 'bg-primary-light text-primary'
          : 'hover:bg-surface text-text-secondary hover:text-text-primary')
      }
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
          className="flex-1 bg-transparent border-b border-primary outline-none text-sm"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <>
          <span className="flex-1 truncate text-sm">{session.title}</span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-border rounded transition-opacity"
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
              className="absolute right-0 top-full mt-1 bg-surface-solid border border-border rounded-md shadow-lg py-1 z-10 min-w-[120px]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
              >
                Rename
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-elevated"
                onClick={() => {
                  deleteSession(session.id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
