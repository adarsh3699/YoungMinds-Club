import { Fragment } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Tabs = ({ tabs }) => {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-800 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                classNames(
                  'w-full p-2.5 text-sm font-medium leading-5 rounded-lg transition-colors',
                  'focus:outline-none',
                  selected
                    ? 'bg-gray-700 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-0">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.key}
              className={classNames(
                'rounded-b-lg',
                'focus:outline-none'
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