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
      className="bg-white border-b border-gray-200 sticky top-0 z-10"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs.List className="flex">
          <Tabs.Trigger
            value="now"
            className="flex-1 text-center py-4 px-4 font-medium transition-colors text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            Now
          </Tabs.Trigger>
          <Tabs.Trigger
            value="timetable"
            className="flex-1 text-center py-4 px-4 font-medium transition-colors text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            Timetable
          </Tabs.Trigger>
        </Tabs.List>
      </div>
    </Tabs.Root>
  );
}

