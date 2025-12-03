import * as Tabs from '@radix-ui/react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { cva, vi } from '../utils/visionImpaired';

const tabsRoot = cva(
  'bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10 shadow-lg'
);
const tabsRootVisionImpaired =
  'vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-b-2';

const tabTrigger = cva(
  'flex-1 text-center py-4 px-4 font-semibold transition-all text-slate-400 hover:text-slate-200 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-gradient-to-b from-cyan-500/10 to-transparent'
);
const tabTriggerVisionImpaired =
  'vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white vision-impaired:hover:text-white vision-impaired:data-[state=active]:text-white vision-impaired:data-[state=active]:border-white vision-impaired:data-[state=active]:border-b-4 vision-impaired:data-[state=active]:bg-cyan-600';

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
      className={vi(tabsRoot(), tabsRootVisionImpaired)}
    >
      <div className="max-w-7xl mx-auto">
        <Tabs.List className="flex">
          <Tabs.Trigger
            value="now"
            className={vi(tabTrigger(), tabTriggerVisionImpaired)}
          >
            Now
          </Tabs.Trigger>
          <Tabs.Trigger
            value="timetable"
            className={vi(tabTrigger(), tabTriggerVisionImpaired)}
          >
            Timetable
          </Tabs.Trigger>
        </Tabs.List>
      </div>
    </Tabs.Root>
  );
}
