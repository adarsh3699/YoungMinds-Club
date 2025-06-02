import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { AccordionProps } from '@/types';

function classNames(...classes: (string | boolean | undefined)[]): string {
	return classes.filter(Boolean).join(' ');
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
	return (
		<div className="w-full">
			{items.map((item, index) => (
				<Disclosure key={item.key || index} as="div" className={index > 0 ? 'mt-2' : ''}>
					{({ open }: { open: boolean }) => (
						<>
							<Disclosure.Button
								className={classNames(
									'flex w-full justify-between rounded-lg ym-bg-yellow-100 px-4 py-3 text-left text-sm font-medium transition-colors',
									'focus:outline-none focus-visible:ring focus-visible:ring-amber-500 focus-visible:ring-opacity-75',
									open ? 'ym-text-yellow-700' : 'ym-text-primary'
								)}
							>
								<span>{item.title}</span>
								<ChevronUpIcon
									className={classNames(
										'h-5 w-5 transition-transform',
										open ? 'transform rotate-180 ym-text-yellow-600' : 'ym-text-muted'
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
								<Disclosure.Panel className="px-4 pt-4 pb-2 text-sm ym-text-secondary">
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