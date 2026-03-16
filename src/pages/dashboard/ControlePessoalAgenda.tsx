import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Menu, Search } from 'lucide-react';

type AgendaEvent = {
  time: string;
  title: string;
  location?: string;
  long?: boolean;
};

const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const eventPalette = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-muted text-foreground',
];

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

const formatSelectedLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
};

const initialMonth = new Date();
initialMonth.setDate(1);

const ControlePessoalAgenda = () => {
  const [monthDate, setMonthDate] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));

  const mockEventsByDate: Record<string, AgendaEvent[]> = useMemo(() => {
    const today = new Date();
    const todayIso = toISODate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    return {
      [todayIso]: [
        { time: '08:00', title: 'Revisar tarefas do dia' },
        { time: '12:15', title: 'Reunião com equipe de operações', long: true },
        { time: '14:30', title: 'Almoço com cliente', location: 'Café Central' },
        { time: '16:45', title: 'Apresentação de proposta', location: 'Escritório Matriz', long: true },
      ],
      [toISODate(tomorrow)]: [
        { time: '09:00', title: 'Follow-up com leads' },
        { time: '15:00', title: 'Ajuste de cronograma semanal', long: true },
      ],
      [toISODate(dayAfter)]: [{ time: '11:30', title: 'Call com parceiro estratégico' }],
    };
  }, []);

  const selectedEvents = mockEventsByDate[selectedDate] || [];

  const calendarCells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];

    for (let i = 0; i < startDay; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [monthDate]);

  const goToPreviousMonth = () => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/90 via-primary to-accent text-primary-foreground">
          <div className="flex items-center justify-between gap-3">
            <Button size="icon" variant="ghost" className="text-primary-foreground hover-scale hover:bg-primary-foreground/15">
              <Menu className="h-5 w-5" />
            </Button>
            <CardTitle className="text-base sm:text-lg">Controle Pessoal • Agenda</CardTitle>
            <Button size="icon" variant="ghost" className="text-primary-foreground hover-scale hover:bg-primary-foreground/15">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-center text-xs sm:text-sm text-primary-foreground/90">{formatSelectedLabel(selectedDate)}</p>
        </CardHeader>

        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="hover-scale">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">
                {formatMonthLabel(monthDate)}
              </Badge>
              <Button variant="outline" size="icon" onClick={goToNextMonth} className="hover-scale">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground sm:text-xs">
              {weekDays.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-11 rounded-md bg-muted/20" />;
                }

                const iso = toISODate(date);
                const isSelected = selectedDate === iso;
                const hasEvents = Boolean(mockEventsByDate[iso]?.length);

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`h-11 rounded-md text-sm font-semibold transition-all hover-scale ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : hasEvents
                          ? 'bg-accent/40 text-accent-foreground hover:bg-accent/55'
                          : 'bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold sm:text-base">Agenda do dia</h2>
            </div>

            <div className="space-y-2">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event, index) => (
                  <article
                    key={`${event.time}-${event.title}`}
                    className={`animate-scale-in rounded-lg p-3 ${eventPalette[index % eventPalette.length]} ${event.long ? 'min-h-20' : ''}`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold opacity-90">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{event.time}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug">{event.title}</p>
                    {event.location ? (
                      <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Sem compromissos para esta data.
                </div>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlePessoalAgenda;
