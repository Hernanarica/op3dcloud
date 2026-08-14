import { Check, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	getCaseStatusClass,
	getCaseStatusDotClass,
	getCaseStatusOnInvertClass,
} from "../lib/patient-ui";

/**
 * Piezas compartidas por las tres vistas del caso: el resumen, los datos del
 * paciente y la planificación.
 *
 * Regla de color de la feature: no hay color de acento. Lo que hay que
 * destacar se resuelve con contraste — negro sobre superficie clara, blanco
 * sobre la invertida — y el color queda reservado a los badges de estado,
 * que son el único lugar donde significa algo.
 */

/** Antetítulo. Máximo uno por card. */
export function Eyebrow({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"text-[11px] leading-4 font-medium tracking-[0.08em] uppercase",
				"text-muted-foreground",
				className,
			)}
		>
			{children}
		</p>
	);
}

export function SectionCard({
	title,
	step,
	action,
	children,
	className,
}: {
	title: string;
	/** Número del paso del formulario, cuando la sección espeja `create.tsx`. */
	step?: number;
	/** Contenido a la derecha del título (un badge, un contador). */
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Card variant="surface" className={cn("gap-5 p-5 md:p-6", className)}>
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="text-base font-semibold tracking-[-0.011em]">
					{title}
				</h3>
				{action ??
					(step !== undefined && (
						<span className="shrink-0 font-mono text-xs text-muted-foreground">
							Paso {step}
						</span>
					))}
			</div>
			<div className="space-y-5">{children}</div>
		</Card>
	);
}

/**
 * Tile de dato. La jerarquía es al revés que antes: la etiqueta arriba en
 * chico y el número grande abajo, que es lo que se lee de un vistazo.
 */
export function StatTile({
	icon: Icon,
	label,
	value,
	hint,
	muted,
}: {
	icon?: React.ElementType;
	label: string;
	value: React.ReactNode;
	hint?: string;
	/** Atenúa el valor cuando es un placeholder y no un dato real. */
	muted?: boolean;
}) {
	// La escala depende del dato: un número entra en display grande, pero un
	// texto como "Alineadores Premium" a ese tamaño no entra y se corta.
	const isNumeric =
		typeof value === "number" ||
		(typeof value === "string" && /^\d+$/.test(value.trim()));

	return (
		<Card variant="surface" className="gap-0 p-5">
			<div className="flex items-start justify-between gap-3">
				<Eyebrow>{label}</Eyebrow>
				{Icon && (
					<span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
						<Icon className="size-4" />
					</span>
				)}
			</div>
			<p
				className={cn(
					"mt-4",
					isNumeric
						? "truncate text-3xl leading-none font-semibold tracking-[-0.02em] tabular-nums"
						: // Dos líneas antes de cortar: los nombres de plan y
							// de complejidad rara vez entran en una.
							"line-clamp-2 text-lg leading-snug font-medium tracking-[-0.01em]",
					muted && "font-normal text-muted-foreground",
					muted && isNumeric && "text-xl tracking-normal",
				)}
			>
				{value || "No especificado"}
			</p>
			{hint && (
				<p className="mt-2 truncate text-xs text-muted-foreground">
					{hint}
				</p>
			)}
		</Card>
	);
}

/**
 * Fila de recurso del caso (render 3D, informe, PDF). Reemplaza a las cards
 * de un solo link, que ocupaban una card entera para una línea de texto.
 */
export function ActionRow({
	icon: Icon,
	title,
	hint,
	href,
	onClick,
	emptyLabel,
}: {
	icon: React.ElementType;
	title: string;
	hint?: string;
	href?: string | null;
	onClick?: () => void;
	/** Texto cuando el recurso todavía no existe. */
	emptyLabel?: string;
}) {
	const isEmpty = !href && !onClick;

	const content = (
		<>
			<span className="grid size-10 shrink-0 place-items-center rounded-tile bg-secondary text-foreground">
				<Icon className="size-4" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-[0.9375rem] font-medium">
					{title}
				</span>
				<span className="block truncate text-xs text-muted-foreground">
					{isEmpty ? (emptyLabel ?? "Pendiente") : hint}
				</span>
			</span>
			{!isEmpty &&
				(href ? (
					<ExternalLink className="size-4 shrink-0 text-muted-foreground" />
				) : (
					<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
				))}
		</>
	);

	const base =
		"flex w-full items-center gap-3 rounded-tile p-3 text-left transition-colors duration-150 ease-out";

	if (isEmpty) {
		return (
			<div
				className={cn(base, "pointer-events-none opacity-55")}
				aria-disabled="true"
			>
				{content}
			</div>
		);
	}

	if (href) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={cn(base, "hover:bg-secondary/60")}
			>
				{content}
			</a>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				base,
				"hover:bg-secondary/60 active:scale-[0.99]",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
			)}
		>
			{content}
		</button>
	);
}

/**
 * Barra de progreso. Anima `scaleX` y no `width`: `width` dispara layout en
 * cada frame.
 */
export function ProgressBar({
	value,
	className,
	trackClassName,
}: {
	/** Entre 0 y 1. */
	value: number;
	/** Color del relleno. Por defecto sigue al texto: negro en claro,
	    blanco en oscuro. Sobre el hero invertido se pasa el opuesto. */
	className?: string;
	trackClassName?: string;
}) {
	const ratio = Math.min(Math.max(value, 0), 1);

	return (
		<div
			className={cn(
				"h-1.5 w-full overflow-hidden rounded-full bg-secondary",
				trackClassName,
			)}
		>
			<div
				className={cn(
					"h-full origin-left rounded-full bg-foreground",
					"transition-transform duration-500 ease-out",
					className,
				)}
				style={{ transform: `scaleX(${ratio})` }}
			/>
		</div>
	);
}

export function CaseStatusBadge({
	status,
	onInvert,
}: {
	status: string;
	/** Sobre el hero oscuro el pastel claro no se lee. */
	onInvert?: boolean;
}) {
	return (
		<Badge
			variant="soft"
			className={cn(
				onInvert
					? getCaseStatusOnInvertClass()
					: getCaseStatusClass(status),
			)}
		>
			<span
				className={cn(
					"size-1.5 rounded-full",
					getCaseStatusDotClass(status),
				)}
			/>
			{status}
		</Badge>
	);
}

/** Valores de un multi-select, listados con el mismo `Check` del formulario. */
export function FieldChecklist({
	label,
	values,
}: {
	label: string;
	values: string[];
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-baseline gap-2">
				<h4 className="text-sm font-medium">{label}</h4>
				{values.length > 0 && (
					<span className="text-xs text-muted-foreground tabular-nums">
						{values.length}
					</span>
				)}
			</div>
			{values.length > 0 ? (
				<ul className="space-y-2.5">
					{values.map((value) => (
						<li key={value} className="flex items-start gap-2.5">
							<span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-secondary">
								<Check className="size-3 text-foreground" />
							</span>
							<span className="text-[0.9375rem] leading-6">
								{value}
							</span>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-muted-foreground">No especificado</p>
			)}
		</div>
	);
}
