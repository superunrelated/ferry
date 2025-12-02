import * as Tabs from '@radix-ui/react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';

export function TabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname === '/' ? 'now' : 'timetable';

  return (
    <Tabs.Root
      value={currentTab}
      onValueChange={(value) => {
        if (value === 'now') {
          navigate('/');
        } else if (value === 'timetable') {
          navigate('/timetable');
        }
      }}
      className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto">
        <Tabs.List className="flex">
          <Tabs.Trigger
            value="now"
            className="flex-1 text-center py-4 px-4 font-semibold transition-all text-slate-400 hover:text-slate-200 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-gradient-to-b from-cyan-500/10 to-transparent"
          >
            Now
          </Tabs.Trigger>
          <Tabs.Trigger
            value="timetable"
            className="flex-1 text-center py-4 px-4 font-semibold transition-all text-slate-400 hover:text-slate-200 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-gradient-to-b from-cyan-500/10 to-transparent"
          >
            Timetable
          </Tabs.Trigger>
        </Tabs.List>
      </div>
    </Tabs.Root>
  );
}

