/**
 * Layer map. Raw z-index numbers are forbidden outside this file.
 *
 *   0    content     scrollable body, cards
 *   10   sticky      sticky section headers, floating labels
 *   20   floating    FAB, floating pills
 *   30   tabBar      bottom navigation
 *   40   header      app header
 *   50   scrim       dim layer behind overlays
 *   60   sheet       bottom sheets, modals, action sheets
 *   80   banner      offline / connectivity banner (above sheets on purpose)
 *   100  toast       toasts and snackbars — always on top
 */
export const zIndex = {
  content: 0,
  sticky: 10,
  floating: 20,
  tabBar: 30,
  header: 40,
  scrim: 50,
  sheet: 60,
  banner: 80,
  toast: 100,
} as const;

export type ZIndexToken = keyof typeof zIndex;
