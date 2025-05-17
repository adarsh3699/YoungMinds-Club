import { Fragment } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full">
      <Tab.Group selectedIndex={tabs.findIndex(tab => tab.id === activeTab)} onChange={(index) => onTabChange && onTabChange(tabs[index].id)}>
        <Tab.List className="flex space-x-1 bg-gray-800 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.key || tab.id}
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
              <div className="flex items-center justify-center space-x-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-0">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.key || tab.id}
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