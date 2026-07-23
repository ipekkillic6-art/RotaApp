import { palette } from './palette';

export type ThemeMode = 'light' | 'dark';

/**
 * Semantic colors.
 *
 * Consumers never ask for "teal 600" — they ask for `action.primary` or
 * `status.onTheWay`. That indirection is what makes the dark theme a
 * one-file change and keeps status meaning stable across surfaces.
 */

/* ── Delivery status ────────────────────────────────────────────────────
 * Nine statuses, but NOT nine hues — a rainbow would make a dense ops list
 * unreadable and would collide with success/danger. Instead:
 *
 *   waiting   slate    nothing is moving yet
 *   matching  slate-lit the system is working (assigning)
 *   engaged   teal     a courier is committed (assigned / accepted)
 *   live      bright teal the package is physically moving (picked up / on the way)
 *   success   green    delivered
 *   danger    red      failed
 *   muted     slate    cancelled
 *
 * Progress is carried by the stepper, the icon and the label — never by hue
 * alone. See `statusMeta` in `domain/delivery/status.ts`.
 * ------------------------------------------------------------------------ */
export interface StatusColors {
  pending: string;
  assigning: string;
  assigned: string;
  accepted: string;
  pickedUp: string;
  onTheWay: string;
  delivered: string;
  failed: string;
  cancelled: string;
  /** Not a delivery status — an overlay signal for SLA breaches. */
  delayed: string;
}

export interface RoleColors {
  customer: string;
  courier: string;
  admin: string;
}

export interface ThemeColors {
  background: {
    /** App canvas. */
    primary: string;
    /** Grouped/inset areas, sunken rows. */
    secondary: string;
    /** Cards and sheets that sit above the canvas. */
    elevated: string;
    /** Highest surface — popovers, toasts, sheets over sheets. */
    overlay: string;
    /** Scrim behind modals. */
    scrim: string;
    /** Subtle brand wash for hero/info areas. */
    brandSubtle: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    /** On top of a filled action/brand surface — flips with the theme. */
    inverse: string;
    /**
     * Foreground on a fill whose colour is the same in both themes (error
     * badge, switch thumb). Deliberately does NOT flip: white-on-red must stay
     * white in dark mode too.
     */
    onSolid: string;
    /** Links / brand-tinted text. */
    accent: string;
    danger: string;
    success: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
    focused: string;
    error: string;
  };
  action: {
    primary: string;
    primaryPressed: string;
    /** Filled-tonal secondary (brand tint on surface). */
    secondary: string;
    secondaryPressed: string;
    disabled: string;
    disabledText: string;
    danger: string;
    dangerPressed: string;
    /** Ripple/press wash on transparent controls. */
    pressOverlay: string;
  };
  status: StatusColors;
  /** Low-opacity fills for status badges/chips (paired with `status`). */
  statusSurface: StatusColors;
  feedback: {
    success: string;
    successSurface: string;
    warning: string;
    warningSurface: string;
    error: string;
    errorSurface: string;
    info: string;
    infoSurface: string;
  };
  role: RoleColors;
  roleSurface: RoleColors;
  /** Skeleton base + shimmer highlight. */
  skeleton: { base: string; highlight: string };
  /** Map placeholder rendering (we ship no map SDK at this stage). */
  map: { canvas: string; road: string; route: string; marker: string };
}

/* ------------------------------------------------------------------------ */

export const lightColors: ThemeColors = {
  background: {
    primary: palette.slate[25],
    secondary: palette.slate[50],
    elevated: palette.white,
    overlay: palette.white,
    scrim: 'rgba(10, 15, 21, 0.45)',
    brandSubtle: palette.teal[50],
  },
  text: {
    primary: palette.slate[900],
    secondary: palette.slate[600],
    // `muted` carries 11px captions and placeholders, so it is held to full AA
    // rather than the 3:1 decorative floor.
    muted: palette.slate[500],
    inverse: palette.white,
    onSolid: palette.white,
    accent: palette.teal[700],
    danger: palette.red[600],
    success: palette.green[600],
  },
  border: {
    default: palette.slate[200],
    subtle: palette.slate[100],
    strong: palette.slate[300],
    focused: palette.teal[500],
    error: palette.red[500],
  },
  action: {
    primary: palette.teal[600],
    primaryPressed: palette.teal[700],
    secondary: palette.teal[50],
    secondaryPressed: palette.teal[100],
    disabled: palette.slate[100],
    disabledText: palette.slate[500],
    danger: palette.red[600],
    dangerPressed: palette.red[700],
    pressOverlay: 'rgba(10, 125, 116, 0.08)',
  },
  // Foregrounds are chosen against their own tinted surface below, not against
  // the page — badge text is 11px, so every pair must clear 4.5:1 there.
  status: {
    pending: palette.slate[600],
    assigning: palette.slate[600],
    assigned: palette.teal[600],
    accepted: palette.teal[600],
    pickedUp: palette.teal[700],
    onTheWay: palette.teal[700],
    delivered: palette.green[700],
    failed: palette.red[600],
    cancelled: palette.slate[600],
    delayed: palette.amber[700],
  },
  statusSurface: {
    pending: palette.slate[100],
    assigning: palette.slate[100],
    assigned: palette.teal[50],
    accepted: palette.teal[50],
    pickedUp: palette.teal[100],
    onTheWay: palette.teal[100],
    delivered: palette.green[100],
    failed: palette.red[100],
    cancelled: palette.slate[100],
    delayed: palette.amber[100],
  },
  feedback: {
    success: palette.green[700],
    successSurface: palette.green[100],
    warning: palette.amber[700],
    warningSurface: palette.amber[100],
    error: palette.red[600],
    errorSurface: palette.red[100],
    info: palette.teal[700],
    infoSurface: palette.teal[50],
  },
  role: {
    customer: palette.teal[600],
    courier: palette.violet[600],
    admin: palette.slate[700],
  },
  roleSurface: {
    customer: palette.teal[50],
    courier: palette.violet[100],
    admin: palette.slate[100],
  },
  skeleton: { base: palette.slate[100], highlight: palette.slate[50] },
  map: {
    canvas: palette.slate[100],
    road: palette.slate[200],
    route: palette.teal[500],
    marker: palette.teal[700],
  },
};

export const darkColors: ThemeColors = {
  background: {
    primary: palette.slate[950],
    secondary: palette.slate[900],
    elevated: palette.slate[850],
    overlay: palette.slate[800],
    scrim: 'rgba(0, 0, 0, 0.62)',
    brandSubtle: 'rgba(34, 182, 170, 0.10)',
  },
  text: {
    primary: '#F2F6F8',
    secondary: palette.slate[300],
    muted: palette.slate[400],
    inverse: palette.slate[950],
    onSolid: palette.white,
    accent: palette.teal[300],
    danger: palette.red[300],
    success: palette.green[300],
  },
  border: {
    default: 'rgba(255, 255, 255, 0.10)',
    subtle: 'rgba(255, 255, 255, 0.06)',
    strong: 'rgba(255, 255, 255, 0.18)',
    focused: palette.teal[400],
    error: palette.red[400],
  },
  action: {
    primary: palette.teal[500],
    primaryPressed: palette.teal[600],
    secondary: 'rgba(34, 182, 170, 0.14)',
    secondaryPressed: 'rgba(34, 182, 170, 0.22)',
    disabled: 'rgba(255, 255, 255, 0.07)',
    disabledText: palette.slate[500],
    // Lighter than the light-theme danger: the label on a filled danger button
    // is dark ink in dark mode, so the fill has to be bright enough to carry it.
    danger: palette.red[400],
    dangerPressed: palette.red[500],
    pressOverlay: 'rgba(255, 255, 255, 0.08)',
  },
  status: {
    pending: palette.slate[300],
    assigning: palette.slate[300],
    assigned: palette.teal[300],
    accepted: palette.teal[300],
    pickedUp: palette.teal[200],
    onTheWay: palette.teal[200],
    delivered: palette.green[300],
    failed: palette.red[300],
    cancelled: palette.slate[300],
    delayed: palette.amber[300],
  },
  statusSurface: {
    pending: 'rgba(137, 150, 165, 0.16)',
    assigning: 'rgba(180, 192, 204, 0.14)',
    assigned: 'rgba(34, 182, 170, 0.16)',
    accepted: 'rgba(34, 182, 170, 0.16)',
    pickedUp: 'rgba(85, 210, 198, 0.20)',
    onTheWay: 'rgba(85, 210, 198, 0.20)',
    delivered: 'rgba(62, 208, 127, 0.18)',
    failed: 'rgba(238, 112, 112, 0.18)',
    cancelled: 'rgba(137, 150, 165, 0.12)',
    delayed: 'rgba(242, 178, 60, 0.18)',
  },
  feedback: {
    success: palette.green[300],
    successSurface: 'rgba(62, 208, 127, 0.16)',
    warning: palette.amber[300],
    warningSurface: 'rgba(242, 178, 60, 0.16)',
    error: palette.red[300],
    errorSurface: 'rgba(238, 112, 112, 0.16)',
    info: palette.teal[300],
    infoSurface: 'rgba(34, 182, 170, 0.14)',
  },
  role: {
    customer: palette.teal[300],
    courier: palette.violet[300],
    admin: palette.slate[300],
  },
  roleSurface: {
    customer: 'rgba(34, 182, 170, 0.16)',
    courier: 'rgba(155, 123, 240, 0.18)',
    admin: 'rgba(180, 192, 204, 0.14)',
  },
  skeleton: {
    base: 'rgba(255, 255, 255, 0.06)',
    highlight: 'rgba(255, 255, 255, 0.13)',
  },
  map: {
    canvas: palette.slate[900],
    road: palette.slate[800],
    route: palette.teal[400],
    marker: palette.teal[300],
  },
};

export const colorsFor = (mode: ThemeMode): ThemeColors =>
  mode === 'dark' ? darkColors : lightColors;
