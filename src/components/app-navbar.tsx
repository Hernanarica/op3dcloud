import {
	ArrowLeftRight,
	ClipboardList,
	FingerprintIcon,
	LayoutDashboard,
	LogOut,
	Monitor,
	Moon,
	Sun,
	User2,
	UsersRound,
} from "lucide-react";
import { Navbar, type NavItem } from "@/components/navbar";
import { useSignOut } from "@/hooks/useSignOut";
import { useUserRole } from "@/hooks/useUserRole";
import { useThemeStore } from "@/state/stores/useThemeStore";
import type { UserRole } from "@/types/db/users/roles";

const WHATSAPP_NUMBER = "5491178898573";
const WHATSAPP_MESSAGE = "¡Hola! Quiero más información sobre OrthoPlanner3D.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const NAV_ITEMS: {
	id: string;
	label: string;
	url: string;
	icon: typeof LayoutDashboard;
	roles: UserRole[];
}[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		url: "/",
		icon: LayoutDashboard,
		roles: ["admin", "planner"],
	},
	{
		id: "patients",
		label: "Pacientes",
		url: "/pacientes",
		icon: UsersRound,
		roles: ["admin", "planner", "client"],
	},
	{
		id: "treatment-planning",
		label: "Planificación de Tratamiento",
		url: "/planificacion-tratamiento",
		icon: ClipboardList,
		roles: ["admin", "planner"],
	},
];

function WhatsAppIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
			<path d="M12.05 2C6.578 2 2.13 6.447 2.13 11.92c0 1.876.52 3.632 1.427 5.13L2 22l5.09-1.526a9.86 9.86 0 0 0 4.96 1.34h.005c5.472 0 9.919-4.447 9.919-9.919C21.974 6.447 17.527 2 12.05 2zm0 18.17h-.004a8.21 8.21 0 0 1-4.19-1.148l-.3-.179-3.017.905.905-2.94-.196-.313a8.19 8.19 0 0 1-1.264-4.375c0-4.535 3.69-8.226 8.226-8.226 4.535 0 8.225 3.69 8.225 8.226 0 4.535-3.69 8.226-8.225 8.226z" />
		</svg>
	);
}

export function AppNavbar({ className }: { className?: string }) {
	const { role } = useUserRole();
	const { theme, setTheme } = useThemeStore();
	const { signOut } = useSignOut();

	const items: NavItem[] = NAV_ITEMS.filter(
		(item) => role && item.roles.includes(role),
	).map((item) => ({
		id: item.id,
		label: item.label,
		url: item.url,
		icon: <item.icon className="size-4.5" />,
	}));

	const ThemeIcon =
		theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

	const userItems: NavItem["items"] = [
		{
			id: "profile",
			label: "Mi Perfil",
			icon: <User2 className="size-4.5" />,
			url: "/perfil",
		},
		...(role === "admin"
			? [
					{
						id: "accesses",
						label: "Accesos",
						icon: <FingerprintIcon className="size-4.5" />,
						url: "/accesos",
					},
					{
						id: "exchange-rates",
						label: "Tipos de cambio",
						icon: <ArrowLeftRight className="size-4.5" />,
						url: "/tipos-de-cambio",
					},
				]
			: []),
		{
			id: "signout",
			label: "Log out",
			icon: <LogOut className="size-4.5" />,
			onSelect: () => {
				void signOut();
			},
		},
	];

	const endItems: NavItem[] = [
		{
			id: "theme",
			label: "Tema",
			icon: <ThemeIcon className="size-5.5" />,
			items: [
				{
					id: "theme-light",
					label: "Claro",
					icon: <Sun className="size-4.5" />,
					onSelect: () => setTheme("light"),
				},
				{
					id: "theme-dark",
					label: "Oscuro",
					icon: <Moon className="size-4.5" />,
					onSelect: () => setTheme("dark"),
				},
				{
					id: "theme-system",
					label: "Sistema",
					icon: <Monitor className="size-4.5" />,
					onSelect: () => setTheme("system"),
				},
			],
		},
		{
			id: "whatsapp",
			label: "WhatsApp",
			icon: <WhatsAppIcon className="size-5.5" />,
			onSelect: () => {
				window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
			},
		},
		{
			id: "user",
			label: "Cuenta",
			icon: <User2 className="size-6.5" />,
			items: userItems,
		},
	];

	return <Navbar className={className} items={items} endItems={endItems} />;
}
