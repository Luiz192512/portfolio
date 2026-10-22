import type { SVGProps } from 'react';

export type IconName =
  | 'star'
  | 'arrow-up-right'
  | 'arrow-down'
  | 'menu'
  | 'close'
  | 'quote'
  | 'mail'
  | 'user'
  | 'download'
  | 'folder'
  | 'award'
  | 'briefcase';

const PATHS: Record<IconName, string> = {
  star: 'M12 2l2.9 6.6 7.1.7-5.3 4.7 1.5 7L12 17.3 5.8 21l1.5-7L2 9.3l7.1-.7L12 2z',
  'arrow-up-right': 'M7 17L17 7M8 7h9v9',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  quote: 'M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  folder: 'M3 6h6l2 2h10v11H3z',
  award: 'M12 14a6 6 0 100-12 6 6 0 000 12zM8.5 13.5L7 22l5-3 5 3-1.5-8.5',
  briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
};

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & { name: IconName; size?: number };

/** Decorative by default (aria-hidden). Pass `aria-label` and `role="img"` to expose one. */
export function Icon({ name, size = 20, ...rest }: IconProps) {
  const filled = name === 'star';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
