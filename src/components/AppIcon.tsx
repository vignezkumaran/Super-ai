import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polyline, Rect } from 'react-native-svg';

export type AppIconName =
  | 'message-circle'
  | 'clock'
  | 'hard-drive'
  | 'settings'
  | 'plus'
  | 'paperclip'
  | 'send'
  | 'search'
  | 'x-circle'
  | 'database'
  | 'refresh-cw'
  | 'download'
  | 'square'
  | 'cloud'
  | 'cpu'
  | 'info'
  | 'shield'
  | 'shuffle'
  | 'trash-2'
  | 'chevron-down';

interface Props {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const AppIcon = ({
  name,
  size = 20,
  color = '#111',
  strokeWidth = 2,
}: Props) => {
  const s = strokeWidth;

  const common = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth: s,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'message-circle' && (
        <>
          <Path d="M5 7.5a3.5 3.5 0 0 1 3.5-3.5h7A3.5 3.5 0 0 1 19 7.5v5A3.5 3.5 0 0 1 15.5 16H11l-3.8 3v-3H8.5A3.5 3.5 0 0 1 5 12.5z" {...common} />
          <Line x1="9" y1="10" x2="15" y2="10" {...common} />
          <Line x1="9" y1="13" x2="13" y2="13" {...common} />
        </>
      )}

      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="7" x2="12" y2="12" {...common} />
          <Line x1="12" y1="12" x2="16" y2="14" {...common} />
        </>
      )}

      {name === 'hard-drive' && (
        <>
          <Rect x="3" y="6" width="18" height="12" rx="2" {...common} />
          <Line x1="7" y1="12" x2="9" y2="12" {...common} />
          <Line x1="15" y1="12" x2="17" y2="12" {...common} />
        </>
      )}

      {name === 'settings' && (
        <>
          <Circle cx="12" cy="12" r="2.4" {...common} />
          <Path d="M19.4 13.5v-3l-2-.5-.4-1 1.2-1.8-2.1-2.1-1.8 1.2-1-.4-.5-2h-3l-.5 2-1 .4-1.8-1.2-2.1 2.1 1.2 1.8-.4 1-2 .5v3l2 .5.4 1-1.2 1.8 2.1 2.1 1.8-1.2 1 .4.5 2h3l.5-2 1-.4 1.8 1.2 2.1-2.1-1.2-1.8.4-1z" {...common} />
        </>
      )}

      {name === 'plus' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}

      {name === 'paperclip' && (
        <Path d="M8 12l6-6a3 3 0 1 1 4 4l-8 8a5 5 0 0 1-7-7l8-8" {...common} />
      )}

      {name === 'send' && (
        <>
          <Path d="M22 2L11 13" {...common} />
          <Path d="M22 2L15 22l-4-9-9-4 20-7z" {...common} />
        </>
      )}

      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="7" {...common} />
          <Line x1="16.65" y1="16.65" x2="21" y2="21" {...common} />
        </>
      )}

      {name === 'x-circle' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="9" y1="9" x2="15" y2="15" {...common} />
          <Line x1="15" y1="9" x2="9" y2="15" {...common} />
        </>
      )}

      {name === 'database' && (
        <>
          <Ellipse cx="12" cy="6" rx="8" ry="3" {...common} />
          <Path d="M4 6v8c0 1.7 3.6 3 8 3s8-1.3 8-3V6" {...common} />
          <Path d="M4 10c0 1.7 3.6 3 8 3s8-1.3 8-3" {...common} />
        </>
      )}

      {name === 'refresh-cw' && (
        <>
          <Path d="M21 12a9 9 0 1 1-2.64-6.36" {...common} />
          <Polyline points="21 3 21 9 15 9" {...common} />
        </>
      )}

      {name === 'download' && (
        <>
          <Line x1="12" y1="4" x2="12" y2="14" {...common} />
          <Polyline points="8 10 12 14 16 10" {...common} />
          <Line x1="5" y1="20" x2="19" y2="20" {...common} />
        </>
      )}

      {name === 'square' && <Rect x="6" y="6" width="12" height="12" {...common} />}

      {name === 'cloud' && (
        <Path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.1 8.7 4.5 4.5 0 0 0 7 18z" {...common} />
      )}

      {name === 'cpu' && (
        <>
          <Rect x="8" y="8" width="8" height="8" {...common} />
          <Path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" {...common} />
        </>
      )}

      {name === 'info' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="11" x2="12" y2="16" {...common} />
          <Circle cx="12" cy="8" r="0.8" fill={color} />
        </>
      )}

      {name === 'shield' && (
        <Path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" {...common} />
      )}

      {name === 'shuffle' && (
        <>
          <Path d="M16 3h5v5" {...common} />
          <Path d="M4 20l6-6" {...common} />
          <Path d="M14 14l7 7" {...common} />
          <Path d="M21 3l-7 7" {...common} />
          <Path d="M4 4l5 5" {...common} />
        </>
      )}

      {name === 'trash-2' && (
        <>
          <Polyline points="3 6 5 6 21 6" {...common} />
          <Path d="M19 6l-1 14H6L5 6" {...common} />
          <Path d="M10 11v6M14 11v6" {...common} />
          <Path d="M9 6V4h6v2" {...common} />
        </>
      )}

      {name === 'chevron-down' && <Polyline points="6 9 12 15 18 9" {...common} />}
    </Svg>
  );
};
