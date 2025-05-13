import { Fragment } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Tabs = ({ tabs }) => {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 dark:bg-gray-700/50 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                classNames(
                  'w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white dark:ring-gray-700 ring-opacity-60',
                  selected
                    ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-blue-100/70 dark:hover:bg-gray-800/50 hover:text-blue-700 dark:hover:text-blue-400'
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.key}
              className={classNames(
                'rounded-xl p-3',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white dark:ring-gray-700 ring-opacity-60'
              )}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Tabs; 