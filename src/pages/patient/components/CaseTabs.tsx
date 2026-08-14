import { cn } from "@/lib/utils";

export type CaseTab = "summary" | "details" | "planning";

/**
 * Control segmentado. La píldora activa se desplaza entre pestañas en vez de
 * saltar: el movimiento intermedio le dice al ojo hacia dónde va el foco.
 *
 * Va en blanco sobre track gris, no en negro: el negro de la pantalla ya lo
 * ocupa el hero, y dos piezas oscuras compiten.
 */
export default function CaseTabs({
	activeTab,
	onChange,
	showPlanning,
}: {
	activeTab: CaseTab;
	onChange: (tab: CaseTab) => void;
	showPlanning: boolean;
}) {
	const tabs = [
		{ id: "summary" as const, label: "Resumen", shortLabel: "Resumen" },
		{
			id: "details" as const,
			label: "Datos del paciente",
			shortLabel: "Datos",
		},
		...(showPlanning
			? [
					{
						id: "planning" as const,
						label: "Planificación",
						shortLabel: "Plan",
					},
				]
			: []),
	];

	const activeIndex = Math.max(
		tabs.findIndex((tab) => tab.id === activeTab),
		0,
	);

	return (
		<div
			className="relative inline-grid w-full max-w-md rounded-full bg-secondary p-1"
			style={{
				gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
			}}
		>
			{/* Píldora deslizante */}
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute inset-y-1 left-1 rounded-full bg-card shadow-e1",
					// Se desplaza en pantalla: ease-in-out, no ease-out.
					"transition-transform duration-200 ease-in-out",
				)}
				style={{
					width: `calc((100% - 0.5rem) / ${tabs.length})`,
					transform: `translateX(${activeIndex * 100}%)`,
				}}
			/>

			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					onClick={() => onChange(tab.id)}
					className={cn(
						"relative z-10 inline-flex h-9 items-center justify-center rounded-full px-4",
						"text-sm font-medium transition-colors duration-150 ease-out",
						"focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
						activeTab === tab.id
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<span className="sm:hidden">{tab.shortLabel}</span>
					<span className="hidden truncate sm:inline">
						{tab.label}
					</span>
				</button>
			))}
		</div>
	);
}
