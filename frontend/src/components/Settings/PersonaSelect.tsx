import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Persona } from '../../types';

interface PersonaSelectProps {
  value: string;
  onChange: (value: string) => void;
  personas: Persona[];
  customPersona?: { name: string } | null;
  className?: string;
}

export function PersonaSelect({ 
  value, 
  onChange, 
  personas, 
  customPersona,
  className = '' 
}: PersonaSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPersona = value === 'custom' 
    ? { id: 'custom', name: customPersona?.name || 'Custom', description: 'Your custom persona' }
    : personas.find(p => p.id === value);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && 
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (personaId: string) => {
    onChange(personaId);
    setIsOpen(false);
  };

  const dropdown = isOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed bg-surface-elevated border border-border rounded-lg shadow-xl max-h-72 overflow-y-auto"
      style={{ 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      {personas.map((persona) => (
        <div
          key={persona.id}
          className={`px-3 py-2 cursor-pointer transition-colors ${
            value === persona.id 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-surface text-text-primary'
          }`}
          onClick={() => handleSelect(persona.id)}
          onMouseEnter={() => setHoveredId(persona.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{persona.name}</span>
            {persona.description && (
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          {hoveredId === persona.id && persona.description && (
            <div className="mt-1 px-2 py-1.5 bg-gray-900 text-white text-xs rounded">
              {persona.description}
            </div>
          )}
        </div>
      ))}
      
      {customPersona && (
        <div
          className={`px-3 py-2 cursor-pointer border-t border-border transition-colors ${
            value === 'custom' 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-surface text-text-primary'
          }`}
          onClick={() => handleSelect('custom')}
          onMouseEnter={() => setHoveredId('custom')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{customPersona.name} (Custom)</span>
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {hoveredId === 'custom' && (
            <div className="mt-1 px-2 py-1.5 bg-gray-900 text-white text-xs rounded">
              Your custom persona
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className="w-full p-2 border border-border rounded bg-surface text-text-primary text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
      >
        <span className="truncate">{selectedPersona?.name || 'Select persona'}</span>
        <svg 
          className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdown}
    </div>
  );
}
