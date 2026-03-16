import React, { useMemo } from 'react';
import { AlertTriangle, Clock3 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export interface AgendaTimeRange {
  id: string;
  startMinutes: number;
  endMinutes: number;
  title?: string;
}

interface AgendaTimeRangePickerProps {
  startTime: string;
  endTime: string;
  occupiedRanges: AgendaTimeRange[];
  onChange: (nextStartTime: string, nextEndTime: string) => void;
  onBlockedChange?: () => void;
  stepMinutes?: number;
}

const TOTAL_DAY_MINUTES = 24 * 60;

const clampMinutes = (value: number) => Math.min(TOTAL_DAY_MINUTES, Math.max(0, value));

export const timeToMinutes = (time?: string) => {
  if (!time || !time.includes(':')) return 0;
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return clampMinutes((hour * 60) + minute);
};

export const minutesToTime = (minutes: number) => {
  const safeMinutes = clampMinutes(minutes);
  const hour = Math.floor(safeMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minute = (safeMinutes % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

export const hasRangeConflict = (
  candidateStart: number,
  candidateEnd: number,
  occupiedRanges: AgendaTimeRange[]
) => {
  return occupiedRanges.some((range) => candidateStart < range.endMinutes && candidateEnd > range.startMinutes);
};

const AgendaTimeRangePicker = ({
  startTime,
  endTime,
  occupiedRanges,
  onChange,
  onBlockedChange,
  stepMinutes = 15,
}: AgendaTimeRangePickerProps) => {
  const startMinutes = useMemo(() => timeToMinutes(startTime), [startTime]);
  const endMinutes = useMemo(() => timeToMinutes(endTime), [endTime]);

  const duration = Math.max(stepMinutes, endMinutes - startMinutes);

  const occupiedLabel = occupiedRanges.length
    ? occupiedRanges
        .sort((a, b) => a.startMinutes - b.startMinutes)
        .slice(0, 4)
        .map((range) => `${minutesToTime(range.startMinutes)}-${minutesToTime(range.endMinutes)}`)
        .join(' • ')
    : 'Nenhum horário reservado neste dia';

  const handleRangeChange = (nextRange: number[]) => {
    if (nextRange.length < 2) return;

    const nextStart = Math.min(nextRange[0], nextRange[1]);
    const nextEnd = Math.max(nextRange[0], nextRange[1]);

    if (nextEnd <= nextStart) return;

    if (hasRangeConflict(nextStart, nextEnd, occupiedRanges)) {
      onBlockedChange?.();
      return;
    }

    onChange(minutesToTime(nextStart), minutesToTime(nextEnd));
  };

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          <span>Arraste para definir início e término</span>
        </div>
        <span className="font-medium">Duração: {Math.round(duration)} min</span>
      </div>

      <div className="relative">
        <div className="mb-3 h-2 w-full rounded-full bg-muted">
          {occupiedRanges.map((range) => {
            const left = (range.startMinutes / TOTAL_DAY_MINUTES) * 100;
            const width = ((range.endMinutes - range.startMinutes) / TOTAL_DAY_MINUTES) * 100;

            return (
              <span
                key={`${range.id}-${range.startMinutes}`}
                className="absolute top-0 h-2 rounded-full bg-destructive/40"
                style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }}
                title={`${range.title || 'Compromisso'} (${minutesToTime(range.startMinutes)}-${minutesToTime(range.endMinutes)})`}
              />
            );
          })}
        </div>

        <Slider
          min={0}
          max={TOTAL_DAY_MINUTES}
          step={stepMinutes}
          value={[startMinutes, Math.max(startMinutes + stepMinutes, endMinutes)]}
          minStepsBetweenThumbs={1}
          onValueChange={handleRangeChange}
          aria-label="Selecionar intervalo de horário"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <span>00:00</span>
        <span className="text-center">12:00</span>
        <span className="text-right">24:00</span>
      </div>

      <div className="rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
        <div className="mb-1 inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Horários ocupados:</span>
        </div>
        <p className="line-clamp-2">{occupiedLabel}</p>
      </div>
    </div>
  );
};

export default AgendaTimeRangePicker;
