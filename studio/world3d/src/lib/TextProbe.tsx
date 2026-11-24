// Text probe for engine/tools/text_check.py. Inert unless the render has input prop textProbe=true.
// On each frame it logs every visible DOM string (with computed font-family) as one line: PXI_TEXT <json>.
import React, { useLayoutEffect } from 'react';
import { getInputProps, useCurrentFrame } from 'remotion';

const ON = !!(getInputProps() as any).textProbe;

const visible = (el: Element | null): boolean => {
  let op = 1;
  for (let e = el; e; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    op *= parseFloat(cs.opacity || '1');
  }
  return op > 0.05;
};

const collect = () => {
  const items: { text: string; font: string; kind?: string }[] = [];
  const doneSubs = new Set<Element>();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement;
    if (!el || /^(STYLE|SCRIPT|NOSCRIPT)$/.test(el.tagName)) continue;
    const text = (n.textContent || '').replace(/\s+/g, ' ');
    if (!text.trim() || !visible(el)) continue;
    const sub = el.closest('[data-kind="sub"]');
    if (sub) {
      if (doneSubs.has(sub)) continue;
      doneSubs.add(sub);
      // one string for the whole subtitle, with the font of each piece
      const segs: { text: string; font: string }[] = [];
      const sw = document.createTreeWalker(sub, NodeFilter.SHOW_TEXT);
      for (let m = sw.nextNode(); m; m = sw.nextNode()) segs.push({ text: m.textContent || '', font: getComputedStyle(m.parentElement as Element).fontFamily });
      items.push({ text: segs.map((s) => s.text).join(''), font: segs.map((s) => s.font).join('|'), kind: 'sub', segs } as any);
    } else items.push({ text: text.trim(), font: getComputedStyle(el).fontFamily });
  }
  return items;
};

export const TextProbe: React.FC = () => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!ON) return;
    console.log('PXI_TEXT ' + JSON.stringify({ frame, items: collect() }));
  }, [frame]);
  return null;
};

export const withProbe = <P extends object>(C: React.ComponentType<P>): React.FC<P> => {
  const W: React.FC<P> = (props) => (
    <>
      <C {...props} />
      {ON ? <TextProbe /> : null}
    </>
  );
  return W;
};
