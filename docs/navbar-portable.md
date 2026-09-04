# Navbar flotante — guía de portabilidad

Guía para llevar el componente `Navbar` (pill flotante, fija abajo, con submenús) a otro proyecto: qué instalar, cómo está hecha la animación y cómo evitar que tape contenido.

## 1. Resumen

Es una barra de navegación flotante en forma de pill, fija en la parte inferior de la pantalla. Cada ítem es un botón/link redondeado que:
- revela su label al pasar el mouse (o al abrir su submenú),
- puede abrir un submenú flotante con más opciones (ancla arriba en desktop, se centra como bottom-sheet en mobile),
- se cierra solo al hacer click/tap afuera o con Escape.

El componente en sí (`Navbar`) **no sabe dónde está posicionado en la pantalla** — es agnóstico. El posicionamiento "fijo abajo, sin tapar contenido" vive en el layout que lo envuelve (sección 5).

## 2. Dependencias a instalar

| Paquete | Versión de origen | ¿Obligatoria? | Nota |
|---|---|---|---|
| `react` | ^19 | Sí | Usa `useState`, `useRef`, `useEffect`. No requiere React 19 específicamente, cualquier React 18+ sirve. |
| `react-router` | ^7.5.0 | No | Solo se usa `Link` para navegación. Si el otro proyecto usa Next.js, TanStack Router, Wouter, etc., reemplazá el import de `Link` por el equivalente (ver checklist). |
| `lucide-react` | ^1.21.0 | No | Un solo ícono (`ChevronRightIcon`, la flechita de los submenu-items con `url`). Cambiable por cualquier set de íconos o un SVG propio. |
| `clsx` | ^2.1.1 | Sí (o equivalente) | Usado dentro del helper `cn()`. |
| `tailwind-merge` | ^3.1.0 | Sí (o equivalente) | Usado dentro del helper `cn()`, para mergear clases Tailwind sin conflictos. |
| `tailwindcss` | ^4.1.3 | Sí | Toda la interacción visual (incluida la animación) es CSS vía utility classes de Tailwind, sin `@keyframes` custom. Funciona con Tailwind v3 también, solo revisar que soporte *arbitrary values* en `transition-[...]` (soportado desde Tailwind v3.1+). |
| Componente `Separator` (Shadcn/Radix) | — | No | Se usa `<Separator orientation="vertical" />` entre grupos de items. Es trivial de reemplazar por un `<div className="w-px h-5.5 bg-border" />` si no se porta Shadcn entero. |
| `cuelume` | ^0.1.2 (última en npm: 0.2.2) | **No — opcional** | **Ojo:** no es una librería de animación. Es una librería de **sonidos de interacción** (Web Audio, "curated interaction sounds", cero dependencias runtime). El componente llama `bind()` una vez y le pone `data-cuelume-hover="tick"` a los elementos clickeables para que suenen un "tick" al pasar el mouse/tocar. Se puede eliminar sin ningún efecto visual: sacar el `import { bind } from "cuelume"`, el `useEffect(() => { bind(); }, [])`, y todos los atributos `data-cuelume-hover="tick"`. |

Instalación mínima (con sonido incluido):
```bash
pnpm add react-router lucide-react clsx tailwind-merge cuelume
```

Instalación mínima (sin sonido, solo visual):
```bash
pnpm add react-router lucide-react clsx tailwind-merge
```

## 3. Cómo está hecha la animación

**No usa ninguna librería de animación JS** (ni Framer Motion/Motion, ni GSAP, ni react-spring), a pesar de que el proyecto de origen tiene Motion instalado para otras partes de la app. Todo es CSS puro vía clases de Tailwind con transiciones de estado:

**a) Reveal del label (ícono → ícono+texto)**
```
grid transition-[grid-template-columns,opacity,margin] duration-300 ease-out
group-hover:ml-1.5 group-hover:grid-cols-[1fr] group-hover:opacity-100
```
El truco: el contenedor del label es un `grid` cuya columna pasa de `grid-cols-[0fr]` a `grid-cols-[1fr]` en hover (o cuando el ítem tiene su submenú abierto). Como es una transición de `fr` (fracción del grid), el ancho del texto se revela suavemente **sin necesidad de medir el ancho real del texto en JS** — a diferencia de animar `width` o `max-width` a mano.

**b) Aparición/desaparición del submenú flotante**
```
transition duration-200 ease-out
translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
```
Combina `opacity` + `translate-y` con `duration-200 ease-out`. Se dispara con `group-hover` (CSS puro, cuando el mouse está sobre el ítem) **y** con una clase condicional atada al estado React `open` (para que también abra con click/tap, no solo con hover — necesario en mobile donde no hay hover real).

Conclusión: para portar la animación **no hace falta instalar nada extra** más allá de Tailwind — es 100% utility classes.

## 4. Código del componente

Archivo completo, autocontenido (no depende de rutas ni configuración específica del proyecto de origen):

```tsx
// navbar.tsx
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { bind } from "cuelume"; // opcional — sonido de interacción, ver sección 2
import { ChevronRightIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router"; // cambiar por tu router, ver sección 7

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
			if (!rootRef.current?.contains(event.target as Node)) setOpenId(null);
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
			onToggle={() => setOpenId((id) => (id === item.id ? null : item.id))}
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
			{/* Left group */}
			{items.map((item) => renderItem(item, true))}

			{/* Right group */}
			{endItems?.length ? (
				<>
					<Separator orientation="vertical" className="mx-1 h-5.5" />
					{endItems.map((item) => renderItem(item, false))}
				</>
			) : null}

			{/* Center group */}
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
			<span className="grid shrink-0 place-items-center">{item.icon}</span>
			{expandable && item.label ? (
				// Icon → icon+label reveal via CSS: the grid column grows 0fr→1fr on
				// hover (or while the submenu is open), so the label's natural width
				// is revealed without measuring anything.
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
		// Submenu trigger — toggles the floating panel instead of navigating.
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

		// Link — direct navigation.
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

		// Action — fires `onSelect` (e.g. theme toggle).
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

// Floating submenu. Desktop: anchored above the item's pill with an arrow.
// Mobile: detaches and centers on the viewport so it never gets clipped near
// the screen edges.
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
}: { sub: NavSubItem; onNavigate: () => void }) {
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
			onClick={handleClick}
			className={rowClass}
			data-cuelume-hover="tick"
		>
			{content}
		</button>
	);
}
```

Helper `cn()` que usa (`src/lib/utils.ts` en el origen):
```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

Tokens Tailwind que asume disponibles (vienen de un theme tipo Shadcn): `border-border`, `bg-card`, `text-foreground`, `text-muted-foreground`, `ring-ring`, `bg-popover`, `text-popover-foreground`, `bg-background`. Si el otro proyecto no tiene un theme Shadcn configurado, hay que definir esas variables (o reemplazar las clases por colores fijos).

## 5. Cómo montarlo sin que tape contenido

Este es el detalle importante: el `Navbar` en sí **no se posiciona solo** — el layout que lo envuelve reserva el espacio de abajo para que el contenido de la página nunca quede tapado por la pill fija. Este patrón vive en `PrivateLayout.tsx` del proyecto de origen y hay que replicarlo:

```tsx
// Layout.tsx (o donde envuelvas tus páginas)

// Alto "completo" del bloque del navbar (pill + su padding vertical propio),
// ajustar el 88px si tu navbar mide distinto (medilo con devtools: pill + p-1.5
// del <nav> + el pt-5/pb del wrapper de abajo). El resto de la fórmula respeta
// el home indicator de iOS.
const NAVBAR_OFFSET =
	"calc(88px - 1.25rem + max(1.25rem, env(safe-area-inset-bottom)))";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="relative h-full w-full overflow-hidden"
			style={{ ["--navbar-offset" as string]: NAVBAR_OFFSET }}
		>
			{/* Contenedor del navbar: SIEMPRE transparente, pointer-events-none
			    para que el área vacía alrededor de la pill deje pasar clicks. */}
			<div
				className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
				style={{ background: "transparent" }}
			>
				<Navbar
					className="pointer-events-auto"
					items={items}
					centerItems={centerItems}
					endItems={endItems}
				/>
			</div>

			{/* Scroll a viewport completo: el contenido se ve alrededor de la pill.
			    paddingBottom reserva el hueco de la navbar (sin spacer hermano). */}
			<div className="h-full overflow-auto bg-transparent">
				<div
					className="box-border grid min-h-full bg-transparent"
					style={{ paddingBottom: "var(--navbar-offset)" }}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
```

**Cómo funciona (por qué no se solapa nada):**
- El wrapper del navbar es `fixed inset-x-0 bottom-0 z-50`: siempre pegado abajo, por encima de todo.
- Es `pointer-events-none` en el wrapper y `pointer-events-auto` solo en la pill (`className="pointer-events-auto"` que se le pasa al `Navbar`) — así el espacio transparente a los costados de la pill deja pasar clicks al contenido de abajo, y solo la pill en sí es clickeable.
- El contenido real vive en un contenedor aparte con `overflow-auto` (el scroll ocurre ahí, no en `body`) y le aplica `paddingBottom: var(--navbar-offset)`. Ese padding es exactamente el alto del bloque flotante, así que el final del scroll siempre deja ese hueco libre y nada queda tapado detrás de la pill.
- `env(safe-area-inset-bottom)` + el `max(1.25rem, ...)` es para iOS (home indicator) — si tu proyecto no necesita soportar iOS con notch, podés simplificar a un valor fijo, ej. `paddingBottom: "6rem"` (ajustalo a mano probando en el navegador).

**Si tu navbar termina midiendo distinto** (más o menos items, otro padding), medí el alto real del bloque completo (pill + paddings del wrapper) en devtools y ajustá el `88px` de `NAVBAR_OFFSET` a ese valor — el resto de la fórmula (resta del `pt-5`, safe-area) se mantiene igual.

## 6. Ejemplo de uso (`items` / `centerItems` / `endItems`)

Versión simplificada, desacoplada de stores/config específicos del proyecto de origen — mostrando los tres tipos de ítem (link directo, submenú anidado, acción):

```tsx
import { Navbar, type NavItem } from "./navbar";
import { House, Settings, User, Moon, LogOut } from "lucide-react";

function AppNavbar() {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	// Grupo izquierdo: pills que revelan su label en hover.
	const items: NavItem[] = [
		{
			id: "home",
			label: "Home",
			icon: <House className="size-4.5" />,
			url: "/", // ítem simple → navega directo
		},
		{
			id: "settings",
			label: "Settings",
			icon: <Settings className="size-4.5" />,
			items: [
				// ítem con submenú anidado → abre panel flotante en vez de navegar
				{ id: "settings-profile", label: "Profile", url: "/settings/profile" },
				{ id: "settings-billing", label: "Billing", url: "/settings/billing" },
			],
		},
	];

	// Grupo central (opcional): pills solo-ícono, con su propio separador.
	const centerItems: NavItem[] = [];

	// Grupo derecho: pills solo-ícono, tras un separador.
	const endItems: NavItem[] = [
		{
			id: "theme",
			label: "Toggle theme",
			icon: <Moon className="size-5.5" />,
			onSelect: () => setTheme((t) => (t === "dark" ? "light" : "dark")), // ítem de acción → no navega
		},
		{
			id: "user",
			label: "Account",
			icon: <User className="size-6.5" />,
			items: [
				{
					id: "signout",
					label: "Sign out",
					icon: <LogOut className="size-4.5" />,
					onSelect: () => signOut(),
				},
			],
		},
	];

	return <Navbar items={items} centerItems={centerItems} endItems={endItems} />;
}
```

Reglas rápidas del tipo `NavItem`/`NavSubItem`:
- `url` → renderiza un `<Link>` (navega).
- `onSelect` (sin `url`) → renderiza un `<button>` que ejecuta la función.
- `items` (submenú) → tiene prioridad sobre `url`/`onSelect`: renderiza un `<button>` que abre/cierra el panel flotante en vez de navegar.
- Sin `label` → pill solo-ícono (usar `aria-label` sigue funcionando vía el mismo campo `label`, que también es el texto accesible).

## 7. Checklist de adaptación

- [ ] **Router:** si el otro proyecto no usa `react-router`, reemplazar `import { Link } from "react-router"` por el equivalente:
  - Next.js: `import Link from "next/link"` (prop es `href`, no `to` — ajustar `to={...}` → `href={...}` en las 2 apariciones dentro de `navbar.tsx`).
  - TanStack Router / Wouter / otro: usar su componente de link, o directamente `<a href={sub.url}>` si no hace falta SPA routing.
- [ ] **Sonido (`cuelume`):** decidir si se quiere. Si no, borrar el `import { bind } from "cuelume"`, el `useEffect(() => { bind(); }, [])`, y los 4 atributos `data-cuelume-hover="tick"`.
- [ ] **`Separator`:** portar el componente de Shadcn (`npx shadcn@latest add separator`) o reemplazar `<Separator orientation="vertical" className="mx-1 h-5.5" />` por `<div className="mx-1 h-5.5 w-px bg-border" />`.
- [ ] **Theme tokens:** confirmar que el proyecto tenga definidas las variables `border`, `card`, `foreground`, `muted-foreground`, `ring`, `popover`, `popover-foreground`, `background` (estándar en cualquier setup Shadcn con `bg-background`/`text-foreground`). Si no, mapear a los colores propios del proyecto.
- [ ] **Instalar dependencias** (sección 2).
- [ ] **Montar el layout wrapper** de la sección 5 alrededor de las páginas, y medir/ajustar `NAVBAR_OFFSET` según el alto real de la pill en el nuevo proyecto.
- [ ] Probar en mobile (Safari iOS si es posible) que el `env(safe-area-inset-bottom)` deja el hueco correcto y el submenú en modo bottom-sheet no queda tapado por el home indicator.
