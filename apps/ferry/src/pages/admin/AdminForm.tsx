import { useState } from 'react';
import { DayOfWeek, FerryCompany, Location } from '../../types/timetable';
import { DAYS, DAY_LABELS } from '../../utils/timetableConstants';
import * as Label from '@radix-ui/react-label';
import { cva, vi } from '@ferry/ui';

export interface AdminFormProps {
  departureLocation: Location | null;
  onAddSailing: (time: string, day: DayOfWeek, company: FerryCompany) => void;
}

const formContainer = cva(
  'bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4'
);
const formContainerVisionImpaired =
  'vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-2';

const formRow = cva('flex flex-col sm:flex-row gap-4');
const label = cva('text-sm font-medium text-slate-300 mb-1.5 block');
const labelVisionImpaired =
  'vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white';

const input = cva(
  'px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'
);
const inputVisionImpaired =
  'vision-impaired:bg-black vision-impaired:text-white vision-impaired:border-white vision-impaired:border-2 vision-impaired:text-base';

const select = cva(
  'px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400'
);
const selectVisionImpaired =
  'vision-impaired:bg-black vision-impaired:text-white vision-impaired:border-white vision-impaired:border-2 vision-impaired:text-base';

const button = cva(
  'px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed'
);
const buttonVisionImpaired =
  'vision-impaired:bg-cyan-900 vision-impaired:text-white vision-impaired:font-bold vision-impaired:border-2 vision-impaired:border-white';

export function AdminForm({ departureLocation, onAddSailing }: AdminFormProps) {
  const [time, setTime] = useState('');
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [company, setCompany] = useState<FerryCompany>('Fullers');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time && departureLocation) {
      onAddSailing(time, day, company);
      setTime('');
    }
  };

  if (!departureLocation) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={vi(formContainer(), formContainerVisionImpaired)}
    >
      <div className={formRow()}>
        <div className="flex-1">
          <Label.Root
            htmlFor="time"
            className={vi(label(), labelVisionImpaired)}
          >
            Time
          </Label.Root>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step="300"
            className={vi(input(), inputVisionImpaired)}
            required
          />
        </div>
        <div className="flex-1">
          <Label.Root
            htmlFor="day"
            className={vi(label(), labelVisionImpaired)}
          >
            Day
          </Label.Root>
          <select
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
            className={vi(select(), selectVisionImpaired)}
          >
            {DAYS.map((d, idx) => (
              <option key={d} value={d}>
                {DAY_LABELS[idx]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label.Root
            htmlFor="company"
            className={vi(label(), labelVisionImpaired)}
          >
            Company
          </Label.Root>
          <select
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value as FerryCompany)}
            className={vi(select(), selectVisionImpaired)}
          >
            <option value="Fullers">Fullers</option>
            <option value="Island Direct">Island Direct</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!time}
            className={vi(button(), buttonVisionImpaired)}
          >
            Add Sailing
          </button>
        </div>
      </div>
    </form>
  );
}
