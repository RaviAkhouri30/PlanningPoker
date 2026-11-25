import { IconName } from '@shared/enums/icon-name.enum';
import { type IconShape } from '@shared/interfaces/i-icon-shape';

const path = (d: string): IconShape => ({ kind: 'path', d });

/** The design's icons, copied from its inline SVGs (Room.dc.html, Main.dc.html). */
export const ICON_REGISTRY: Readonly<Record<IconName, readonly IconShape[]>> = {
  [IconName.Alert]: [{ kind: 'circle', cx: 12, cy: 12, r: 9 }, path('M12 8v5M12 16h.01')],
  [IconName.ArrowRight]: [path('M5 12h14M13 5l7 7-7 7')],
  [IconName.Cards]: [
    { kind: 'rect', x: 3, y: 4, width: 8, height: 12, rx: 2 },
    { kind: 'rect', x: 13, y: 8, width: 8, height: 12, rx: 2 },
  ],
  [IconName.Check]: [path('M20 6 9 17l-5-5')],
  [IconName.ChevronDown]: [path('m6 9 6 6 6-6')],
  [IconName.Clock]: [{ kind: 'circle', cx: 12, cy: 12, r: 9 }, path('M12 7v5l3 2')],
  [IconName.Close]: [path('M18 6 6 18M6 6l12 12')],
  [IconName.Coffee]: [
    path('M17 8h1a4 4 0 0 1 0 8h-1'),
    path('M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z'),
    path('M6 2v2M10 2v2M14 2v2'),
  ],
  [IconName.Copy]: [
    { kind: 'rect', x: 9, y: 9, width: 12, height: 12, rx: 2 },
    path('M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'),
  ],
  [IconName.Crown]: [path('m2 7 5 5 5-8 5 8 5-5-2 12H4L2 7z')],
  [IconName.Download]: [path('M12 3v12M7 10l5 5 5-5M5 21h14')],
  [IconName.Eye]: [
    path('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'),
    { kind: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  [IconName.Help]: [
    { kind: 'circle', cx: 12, cy: 12, r: 9 },
    path('M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3'),
    path('M12 17h.01'),
  ],
  [IconName.Link]: [
    path('M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5'),
    path('M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5'),
  ],
  [IconName.Minus]: [path('M5 12h14')],
  [IconName.Monitor]: [
    { kind: 'rect', x: 2, y: 3, width: 20, height: 14, rx: 2 },
    path('M8 21h8M12 17v4'),
  ],
  [IconName.Moon]: [path('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z')],
  [IconName.Plus]: [path('M12 5v14M5 12h14')],
  [IconName.Refresh]: [path('M3 12a9 9 0 1 0 3-6.7L3 8'), path('M3 3v5h5')],
  [IconName.Skip]: [path('m5 4 10 8-10 8V4z'), path('M19 5v14')],
  [IconName.Sparkle]: [path('M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z')],
  [IconName.Sun]: [
    { kind: 'circle', cx: 12, cy: 12, r: 4 },
    path('M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2'),
    path('M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'),
  ],
  [IconName.Users]: [
    path('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'),
    { kind: 'circle', cx: 9, cy: 7, r: 4 },
    path('M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'),
  ],
};
