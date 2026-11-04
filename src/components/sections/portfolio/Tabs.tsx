'use client';

import {
  createContext,
  startTransition,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { m } from 'motion/react';
import { nextTabIndex } from './tabs-keys';

export type TabValue = 'projects' | 'certificates' | 'stack';

type TabsContextValue = {
  state: { value: TabValue; interacted: boolean };
  actions: { select: (value: TabValue) => void };
  meta: { idBase: string };
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used inside Tabs.Root');
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

function Root({ defaultValue = 'projects', children }: { defaultValue?: TabValue; children: ReactNode }) {
  const idBase = useId();
  const [value, setValue] = useState<TabValue>(defaultValue);
  const [interacted, setInteracted] = useState(false);
  const select = useCallback((next: TabValue) => {
    startTransition(() => {
      setValue(next);
      setInteracted(true);
    });
  }, []);
  const ctx = useMemo<TabsContextValue>(
    () => ({ state: { value, interacted }, actions: { select }, meta: { idBase } }),
    [value, interacted, select, idBase],
  );
  return (
    <TabsContext value={ctx}>
      <div>{children}</div>
    </TabsContext>
  );
}

function List({ label, children }: { label: string; children: ReactNode }) {
  const { actions } = useTabs();
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    const current = tabs.findIndex((tab) => tab === document.activeElement);
    if (current < 0) return;
    const next = nextTabIndex(event.key, current, tabs.length);
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next];
    if (!target) return;
    target.focus();
    actions.select(target.dataset.value as TabValue);
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="glass mb-8 inline-flex gap-1 rounded-full p-1"
    >
      {children}
    </div>
  );
}

function Tab({ value, children }: { value: TabValue; children: ReactNode }) {
  const { state, actions, meta } = useTabs();
  const active = state.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={tabId(meta.idBase, value)}
      data-value={value}
      aria-selected={active}
      aria-controls={panelId(meta.idBase, value)}
      tabIndex={active ? 0 : -1}
      onClick={() => actions.select(value)}
      className={[
        'relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-[15px] md:px-6',
        'transition-colors duration-[180ms] ease-micro',
        active ? 'font-medium text-on-accent' : 'text-text-muted hover:text-text',
      ].join(' ')}
    >
      {active ? (
        <m.span
          layoutId="tab-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-accent"
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function Panel({ value, children }: { value: TabValue; children: ReactNode }) {
  const { state, meta } = useTabs();
  const active = state.value === value;
  return (
    <div
      role="tabpanel"
      id={panelId(meta.idBase, value)}
      aria-labelledby={tabId(meta.idBase, value)}
      hidden={!active}
      tabIndex={0}
    >
      <m.div
        key={active ? 'on' : 'off'}
        initial={active && state.interacted ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </m.div>
    </div>
  );
}

// Named exports: a dotted access like Tabs.Root on a client reference is undefined inside a Server Component.
export { Root as TabsRoot, List as TabsList, Tab as TabsTab, Panel as TabsPanel };
export const Tabs = { Root, List, Tab, Panel };
