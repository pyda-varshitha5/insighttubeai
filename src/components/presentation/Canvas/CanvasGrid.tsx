"use client";

interface Props {
  width?: number;
  height?: number;
  gridSize?: number;
}

export default function CanvasGrid({
  width = 960,
  height = 540,
  gridSize = 20,
}: Props) {
  return (
    <>
      {/* Grid */}

      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
      >
        <defs>
          <pattern
            id="smallGrid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#ECECEC"
              strokeWidth="1"
            />
          </pattern>

          <pattern
            id="grid"
            width={gridSize * 5}
            height={gridSize * 5}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={gridSize * 5}
              height={gridSize * 5}
              fill="url(#smallGrid)"
            />

            <path
              d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
              fill="none"
              stroke="#DADADA"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>

        <rect
          width={width}
          height={height}
          fill="url(#grid)"
        />
      </svg>

      {/* Center Horizontal */}

      <div
        className="absolute bg-red-400 opacity-20 pointer-events-none"
        style={{
          left: 0,
          top: height / 2,
          width,
          height: 1,
        }}
      />

      {/* Center Vertical */}

      <div
        className="absolute bg-red-400 opacity-20 pointer-events-none"
        style={{
          left: width / 2,
          top: 0,
          width: 1,
          height,
        }}
      />
    </>
  );
}