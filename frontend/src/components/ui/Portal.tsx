import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: ReactNode;
  container?: Element | DocumentFragment;
};

export function Portal({ children, container }: PortalProps) {
  const target = container ?? document.body;
  return createPortal(children, target);
}
