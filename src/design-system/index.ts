/**
 * Public surface of the design system.
 *
 * Screens import from here (or from a group barrel) and never reach into a
 * component file directly — that is what keeps the internal file layout free
 * to change.
 */
export * from './tokens';
export * from './themes';
export * from './foundations';
export * from './components/buttons';
export * from './components/forms';
export * from './components/feedback';
export * from './components/data-display';
export * from './components/navigation';
export * from './components/overlays';
export * from './components/states';
export * from './domain';
