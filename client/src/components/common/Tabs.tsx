import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { TabsProps } from '@/types';

function classNames(...classes: (string | boolean | undefined)[]): string {
	return classes.filter(Boolean).join(' ');
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
	return (
		<div className="w-full">
			<Tab.Group
				selectedIndex={tabs.findIndex((tab) => tab.id === activeTab)}
				onChange={(index: number) => onTabChange && onTabChange(tabs[index].id)}
			>
				<Tab.List className="flex space-x-1 ym-bg-card border ym-border-card p-1 rounded-lg mb-4">
					{tabs.map((tab) => (
						<Tab
							key={tab.key || tab.id}
							className={({ selected }: { selected: boolean }) =>
								classNames(
									'w-full p-2.5 text-sm font-medium leading-5 rounded-lg transition-colors',
									'focus:outline-none',
									selected
										? 'gradient-bg ym-text-white shadow-md'
										: 'ym-text-muted hover:ym-bg-card-hover hover:ym-text-primary'
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
						<Tab.Panel key={tab.key || tab.id} className={classNames('rounded-b-lg', 'focus:outline-none')}>
							{tab.content}
						</Tab.Panel>
					))}
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};

export default Tabs; 