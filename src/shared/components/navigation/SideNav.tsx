import React, { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/classNames';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SideNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function SideNav({
  items,
  activeId,
  onSelect,
  className,
}: SideNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      aria-label="Sidebar navigation"
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
        'bg-slate-800 border-r border-slate-700',
        'transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Logo / header area */}
      <div
        className={cn(
          'flex items-center h-16 px-3 border-b border-slate-700 shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <span className="text-white font-bold text-sm truncate px-1">
            Foam Calc
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <ul className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg',
                  'text-sm font-medium transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  collapsed ? 'justify-center' : 'justify-start',
                  isActive
                    ? 'bg-brand/15 text-brand'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                )}
                style={{ width: collapsed ? 'calc(100% - 0.5rem)' : 'calc(100% - 0.5rem)' }}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate leading-none">{item.label}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
