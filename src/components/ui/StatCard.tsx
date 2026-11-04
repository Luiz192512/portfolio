import { CountUp } from '@/components/motion/CountUp';
import { GlassPanel } from './GlassPanel';
import { Icon, type IconName } from './Icon';

type StatCardProps = {
  icon: IconName;
  value: number;
  label: string;
  caption: string;
  source?: string;
};

export function StatCard({ icon, value, label, caption, source }: StatCardProps) {
  return (
    <GlassPanel radius="card" className="flex flex-col gap-1 p-4 md:p-7">
      <span className="text-accent">
        <Icon name={icon} size={22} />
      </span>
      <p
        className={[
          'mt-2 text-[34px] font-extrabold leading-none tracking-[-0.03em] md:text-[64px]',
          value === 0 ? 'text-text-subtle' : 'text-text',
        ].join(' ')}
      >
        <CountUp value={value} />
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted md:text-xs">
        {label}
      </p>
      <p className="font-mono text-[10px] text-text-muted md:text-[13px]">{caption}</p>
      {source ? <p className="font-mono text-[10px] text-text-subtle md:text-xs">{source}</p> : null}
    </GlassPanel>
  );
}
