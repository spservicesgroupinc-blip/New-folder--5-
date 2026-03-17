import React, { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function BottomNav({
  items,
  activeId,
  onSelect,
  className,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Bottom navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-slate-800 border-t border-slate-700',
        'flex items-stretch',
        // iOS safe area support
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2',
              'text-xs font-medium transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              isActive
                ? 'text-brand'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <span
              className={cn(
                'transition-transform duration-150',
                isActive && 'scale-110'
              )}
            >
              {item.icon}
            </span>
            <span className="leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
