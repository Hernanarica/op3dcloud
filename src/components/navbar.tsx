import { bind } from "cuelume";
import { ChevronRightIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type NavSubItem = {
	id: string;
	/** Row text and accessible name. Omit for an icon-only row. */
	label?: string;
	icon?: ReactNode;
	/** When present the row renders a router `<Link>`; otherwise a button. */
	url?: string;
	onSelect?: () => void;
};

export type NavItem = {
	id: string;
	/** Pill text and accessible name. Omit for an icon-only pill. */
	label?: string;
	icon: ReactNode;
	/** Direct navigation target — used when the item has no `items`/`onSelect`. */
	url?: string;
	/** Direct action — used when the item has no `items`/`url` (e.g. theme). */
	onSelect?: () => void;
	/** When present the item opens a floating submenu instead of navigating. */
	items?: NavSubItem[];
};

export interface NavbarProps {
	/** Left group — pills expand their label on hover. */
	items: NavItem[];
	/** Center group — icon-only pills, in their own separated section. */
	centerItems?: NavItem[];
	/** Right group — icon-only pills, past the separator. */
	endItems?: NavItem[];
	className?: string;
}

export function Navbar({
	items,
	centerItems,
	endItems,
	className,
}: NavbarProps) {
	const [openId, setOpenId] = useState<string | null>(null);
	const rootRef = useRef<HTMLElement>(null);

	useEffect(() => {
		bind();
	}, []);

	// Close the open submenu on outside tap/click or Escape. Native, one effect.
	// `touchstart` covers mobile; the panel renders INSIDE the <nav> (rootRef),
	// so tapping an item/subitem does not close, but tapping outside does.
	useEffect(() => {
		if (!openId) return;

		const handlePointerDown = (event: MouseEvent | TouchEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpenId(null);
			}
		};
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpenId(null);
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("touchstart", handlePointerDown);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("touchstart", handlePointerDown);
			document.removeEventListener("keydown", handleKey);
		};
	}, [openId]);

	const renderItem = (item: NavItem, expandable: boolean) => (
		<NavbarItem
			key={item.id}
			item={item}
			expandable={expandable}
			open={openId === item.id}
			onToggle={() =>
				setOpenId((id) => (id === item.id ? null : item.id))
			}
			onClose={() => setOpenId(null)}
		/>
	);

	return (
		<nav
			ref={rootRef}
			aria-label="Main navigation"
			className={cn(
				"flex items-center gap-1.5 rounded-[28px] border border-border bg-card p-1.5",
				className,
			)}
		>
			{items.map((item) => renderItem(item, true))}

			{endItems?.length ? (
				<>
					<Separator orientation="vertical" className="mx-1 h-5.5" />
					{endItems.map((item) => renderItem(item, false))}
				</>
			) : null}

			{centerItems?.length ? (
				<>
					<Separator orientation="vertical" className="mx-1 h-5.5" />
					{centerItems.map((item) => renderItem(item, false))}
				</>
			) : null}
		</nav>
	);
}

function NavbarItem({
	item,
	expandable,
	open,
	onToggle,
	onClose,
}: {
	item: NavItem;
	expandable: boolean;
	open: boolean;
	onToggle: () => void;
	onClose: () => void;
}) {
	const hasSubmenu = Boolean(item.items?.length);

	const pillClass = cn(
		"flex h-8.5 min-w-8.5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[19px] px-2 outline-none transition-colors",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-foreground/10",
		open
			? "bg-foreground/10 text-foreground"
			: "text-muted-foreground hover:text-foreground",
		!expandable && !open && "hover:bg-foreground/10 p-0",
	);

	const pillInner = (
		<>
			<span className="grid shrink-0 place-items-center">
				{item.icon}
			</span>
			{expandable && item.label ? (
				<span
					className={cn(
						"grid transition-[grid-template-columns,opacity,margin] duration-300 ease-out group-hover:ml-1.5 group-hover:grid-cols-[1fr] group-hover:opacity-100",
						open
							? "ml-1.5 grid-cols-[1fr] opacity-100"
							: "grid-cols-[0fr] opacity-0",
					)}
				>
					<span className="overflow-hidden whitespace-nowrap text-sm font-medium">
						{item.label}
					</span>
				</span>
			) : null}
		</>
	);

	const renderPill = () => {
		if (hasSubmenu) {
			return (
				<button
					type="button"
					aria-haspopup="menu"
					aria-expanded={open}
					aria-label={item.label}
					onClick={onToggle}
					className={pillClass}
					data-cuelume-hover="tick"
				>
					{pillInner}
				</button>
			);
		}

		if (item.url) {
			return (
				<Link
					to={item.url}
					aria-label={item.label}
					className={pillClass}
					data-cuelume-hover="tick"
				>
					{pillInner}
				</Link>
			);
		}

		return (
			<button
				type="button"
				aria-label={item.label}
				onClick={item.onSelect}
				className={pillClass}
				data-cuelume-hover="tick"
			>
				{pillInner}
			</button>
		);
	};

	return (
		<div className="group relative">
			{renderPill()}
			{hasSubmenu ? (
				<Submenu item={item} open={open} onClose={onClose} />
			) : null}
		</div>
	);
}

function Submenu({
	item,
	open,
	onClose,
}: {
	item: NavItem;
	open: boolean;
	onClose: () => void;
}) {
	return (
		<div
			className={cn(
				"fixed inset-x-4 bottom-21 z-50 mx-auto max-w-xs sm:absolute sm:inset-x-auto sm:bottom-full sm:left-1/2 sm:mx-0 sm:max-w-none sm:-translate-x-1/2 sm:pb-2",
				"pointer-events-none group-hover:pointer-events-auto",
				open && "pointer-events-auto",
			)}
		>
			<div
				role="menu"
				aria-label={item.label}
				className={cn(
					"min-w-0 rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg sm:min-w-52",
					"transition duration-200 ease-out",
					"translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
					open && "translate-y-0 opacity-100",
				)}
			>
				<p className="px-2.5 pb-1 pt-1 text-xs font-medium text-muted-foreground">
					{item.label}
				</p>
				<ul className="space-y-0.5">
					{item.items?.map((sub) => (
						<li key={sub.id}>
							<SubmenuRow sub={sub} onNavigate={onClose} />
						</li>
					))}
				</ul>
				<span className="absolute -bottom-1 left-1/2 hidden size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-border bg-popover sm:block" />
			</div>
		</div>
	);
}

function SubmenuRow({
	sub,
	onNavigate,
}: {
	sub: NavSubItem;
	onNavigate: () => void;
}) {
	const rowClass =
		"flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-sm text-foreground/90 outline-none transition-colors hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring";

	const content = (
		<>
			<span className="flex items-center gap-2 whitespace-nowrap">
				{sub.icon ? (
					<span className="grid size-4.5 shrink-0 place-items-center">
						{sub.icon}
					</span>
				) : null}
				{sub.label}
			</span>
			{sub.url ? (
				<ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
			) : null}
		</>
	);

	const handleClick = () => {
		sub.onSelect?.();
		onNavigate();
	};

	if (sub.url) {
		return (
			<Link
				to={sub.url}
				role="menuitem"
				onClick={handleClick}
				className={rowClass}
				data-cuelume-hover="tick"
			>
				{content}
			</Link>
		);
	}

	return (
		<button
			type="button"
			role="menuitem"
			onClick={handleClick}
			className={rowClass}
			data-cuelume-hover="tick"
		>
			{content}
		</button>
	);
}
