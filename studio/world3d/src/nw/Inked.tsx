import React from 'react';

// Draw children twice: once as a fat ink silhouette, once as fills. Overlapping parts share one outline.
export const Inked: React.FC<{ s: number; children: React.ReactNode; w?: number }> = ({ s, children, w = 2 }) => (
  <>
    <g className="nwink" style={{ ['--w' as any]: `${(w * 2) / s}px` }}>{children}</g>
    {children}
  </>
);
