import React, { useState, useRef, useEffect } from 'react';

const ResizablePanel = ({
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  side = 'right', // 'left' или 'right' - с какой стороны ресайзер
  className = ''
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      e.preventDefault();

      const deltaX = side === 'right'
        ? startXRef.current - e.clientX  // Для правой панели - инвертируем
        : e.clientX - startXRef.current; // Для левой панели - обычное направление

      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );

      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, side]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}

      {/* Ресайзер - вертикальная полоска для перетаскивания */}
      <div
        className={`absolute top-0 ${side === 'right' ? 'left-0' : 'right-0'} bottom-0 cursor-col-resize transition-colors group`}
        style={{
          width: '4px',
          zIndex: 1000
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Расширенная невидимая область для удобного клика */}
        <div
          className="absolute inset-y-0 bg-transparent"
          style={{
            left: '-4px',
            right: '-4px',
            width: '12px'
          }}
        />

        {/* Видимая линия при hover */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-blue-500 transition-colors" />

        {/* Точки посередине для визуального указания */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-white rounded-full shadow-sm"></div>
            <div className="w-1 h-1 bg-white rounded-full shadow-sm"></div>
            <div className="w-1 h-1 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizablePanel;
