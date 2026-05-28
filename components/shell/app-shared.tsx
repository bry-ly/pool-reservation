import type { ReactNode } from "react";
import { IconLayoutGrid, IconPool, IconCalendarClock, IconListDetails } from "@tabler/icons-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "/admin",
				icon: (
					<IconLayoutGrid />
				),
				isActive: true,
			},
		],
	},
	{
		label: "Management",
		items: [
			{
				title: "Pools",
				path: "/admin/pools",
				icon: (
					<IconPool />
				),
			},
			{
				title: "Schedule",
				path: "/admin/schedule",
				icon: (
					<IconCalendarClock />
				),
			},
			{
				title: "Reservations",
				path: "/admin/reservations",
				icon: (
					<IconListDetails />
				),
			},
		],
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
];
