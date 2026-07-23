import type { ReactElement } from 'react';

// Steel/cobalt marks, approximated from the OKLCH theme tokens as concrete
// hex — ImageResponse needs literal CSS colors. BRAND_STEEL tracks
// --primary: oklch(0.46 0.16 255) (the richer-cobalt refresh); update this
// if --primary ever changes again.
export const BRAND_STEEL = '#0055ae';
export const BRAND_PALE = '#f4f7fb';

export function brandIcon(size: number): ReactElement {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_STEEL,
        color: BRAND_PALE,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.62,
        lineHeight: 1,
        borderRadius: size * 0.22,
      }}
    >
      S
    </div>
  );
}
