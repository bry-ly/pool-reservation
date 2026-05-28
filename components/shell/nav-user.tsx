"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLogout } from "@tabler/icons-react";
import { useSignout } from "@/hooks/use-signout";
import { authClient } from "@/lib/auth-client";

export function NavUser() {
	const handleSignout = useSignout();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Avatar className="size-8" />}>
				<AvatarImage src={user?.image || undefined} />
				<AvatarFallback>{(user?.name || "U").charAt(0).toUpperCase()}</AvatarFallback>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex items-center gap-3">
						<Avatar className="size-10">
							<AvatarImage src={user?.image || undefined} />
							<AvatarFallback>{(user?.name || "U").charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground">{user?.name || "User"}</span>{" "}
							<br />
							<div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{user?.email || ""}
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={handleSignout}
						className="w-full cursor-pointer"
						variant="destructive"
					>
						<IconLogout />
						Log out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
