import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Accordion = ({ items }) => {
  return (
    <div className="w-full">
      {items.map((item, index) => (
        <Disclosure key={item.key || index} as="div" className={index > 0 ? 'mt-2' : ''}>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={classNames(
                  'flex w-full justify-between rounded-lg bg-blue-50 dark:bg-gray-700/50 px-4 py-3 text-left text-sm font-medium',
                  'focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75',
                  open ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                )}
              >
                <span>{item.title}</span>
                <ChevronUpIcon
                  className={classNames(
                    'h-5 w-5 transition-transform',
                    open ? 'transform rotate-180 text-blue-500' : 'text-gray-500 dark:text-gray-400'
                  )}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-gray-400">
                  {item.content}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default Accordion; 