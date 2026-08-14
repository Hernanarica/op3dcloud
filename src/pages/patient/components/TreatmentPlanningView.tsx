import {
	Activity,
	ArrowDownToLine,
	ArrowUpToLine,
	Box,
	FileBarChart,
	FileQuestion,
	Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getTreatmentFilePublicUrl } from "@/services/supabase/storage.service";
import type { TreatmentPlanningRow } from "../lib/useTreatmentPlanning";
import {
	ActionRow,
	Eyebrow,
	FieldChecklist,
	SectionCard,
	StatTile,
} from "./case-ui";

interface TreatmentPlanningViewProps {
	treatmentPlanning: TreatmentPlanningRow | null;
	isLoading: boolean;
	isPublic?: boolean;
}

export default function TreatmentPlanningView({
	treatmentPlanning,
	isLoading,
	isPublic = false,
}: TreatmentPlanningViewProps) {
	/** El público no tiene el hero del paciente: necesita su propio marco. */
	const wrapperClass = cn(
		"space-y-4 pb-4 md:space-y-6",
		isPublic && "mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12",
	);

	if (isLoading) {
		return (
			<div className={wrapperClass}>
				{isPublic && <Skeleton className="h-52 rounded-panel" />}
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={k} className="h-32 rounded-card" />
					))}
				</div>
				<Skeleton className="h-48 rounded-card" />
				<Skeleton className="h-48 rounded-card" />
			</div>
		);
	}

	if (!treatmentPlanning) {
		return (
			<div className={wrapperClass}>
				<Card
					variant="surface"
					className="items-center gap-4 p-10 text-center"
				>
					<span className="grid size-16 place-items-center rounded-full bg-secondary">
						<FileQuestion className="size-6 text-muted-foreground" />
					</span>
					<div className="space-y-2">
						<h3 className="text-lg font-semibold tracking-[-0.011em]">
							Sin planificación
						</h3>
						<p className="max-w-sm text-sm leading-6 text-muted-foreground">
							El planificador todavía no completó el formulario de
							este caso.
						</p>
					</div>
				</Card>
			</div>
		);
	}

	const tp = treatmentPlanning;

	const hasTracking = [
		tp.tracking_rotations,
		tp.tracking_extrusions,
		tp.tracking_extrusion_buttons,
		tp.tracking_intrusions,
		tp.tracking_torque,
		tp.tracking_angulations,
		tp.tracking_translations,
		tp.tracking_expansion,
	].some(Boolean);

	const hasQuality = [
		tp.quality_information,
		tp.quality_scan,
		tp.quality_xrays,
		tp.quality_intraoral,
		tp.quality_extraoral,
	].some((a) => a && a.length > 0);

	return (
		<div className={wrapperClass}>
			{/* En la vista pública los números viven dentro del header oscuro:
			    es lo primero que hay que ver al abrir el link. En la pestaña
			    privada el hero ya lo ocupa el paciente, así que van en tiles. */}
			{isPublic ? (
				<PublicPlanningHeader planning={tp} />
			) : (
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<StatTile
						icon={ArrowUpToLine}
						label="Alineadores sup."
						value={tp.upper_aligners}
					/>
					<StatTile
						icon={ArrowDownToLine}
						label="Alineadores inf."
						value={tp.lower_aligners}
					/>
					<StatTile
						icon={Gauge}
						label="Complejidad"
						value={tp.complexity}
					/>
					<StatTile
						icon={Activity}
						label="Pronóstico"
						value={tp.prognosis}
					/>
				</div>
			)}

			{(tp.render_3d || tp.technical_report_url) && (
				<SectionCard title="Archivos del caso" className="gap-3">
					<div className="-mx-1 space-y-0.5">
						{tp.render_3d && (
							<ActionRow
								icon={Box}
								title="Render 3D"
								hint="Planificación interactiva"
								href={tp.render_3d}
							/>
						)}
						{tp.technical_report_url && (
							<ActionRow
								icon={FileBarChart}
								title="Informe técnico"
								hint="Documento del planificador"
								href={getTreatmentFilePublicUrl(
									tp.technical_report_url,
								)}
							/>
						)}
					</div>
				</SectionCard>
			)}

			<SectionCard title="Evaluación clínica">
				<FieldChecklist
					label="Diagnóstico presuntivo general"
					values={tp.diagnosis || []}
				/>
			</SectionCard>

			<SectionCard title="Manufactura">
				<FieldChecklist
					label="Laboratorio"
					values={tp.laboratory || []}
				/>
			</SectionCard>

			<SectionCard title="Plan de acción">
				<FieldChecklist
					label="Criterio de planificación y accionar clínico"
					values={tp.planning || []}
				/>
			</SectionCard>

			{tp.restrictions && tp.restrictions.length > 0 && (
				<SectionCard title="Restricciones">
					<FieldChecklist
						label="Restricciones biomecánicas"
						values={tp.restrictions}
					/>
				</SectionCard>
			)}

			{hasTracking && (
				<SectionCard title="Control de tracking para movimientos complejos">
					<div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
						{tp.tracking_rotations && (
							<DataField
								label="Rotaciones"
								value={tp.tracking_rotations}
							/>
						)}
						{tp.tracking_extrusions && (
							<DataField
								label="Extrusiones (controles clínicos)"
								value={tp.tracking_extrusions}
							/>
						)}
						{tp.tracking_extrusion_buttons && (
							<DataField
								label="Extrusiones (botones programados)"
								value={tp.tracking_extrusion_buttons}
							/>
						)}
						{tp.tracking_intrusions && (
							<DataField
								label="Intrusiones"
								value={tp.tracking_intrusions}
							/>
						)}
						{tp.tracking_torque && (
							<DataField
								label="Torque / inclinaciones"
								value={tp.tracking_torque}
							/>
						)}
						{tp.tracking_angulations && (
							<DataField
								label="Angulaciones"
								value={tp.tracking_angulations}
							/>
						)}
						{tp.tracking_translations && (
							<DataField
								label="Traslaciones"
								value={tp.tracking_translations}
							/>
						)}
						{tp.tracking_expansion && (
							<DataField
								label="Expansión / compresión"
								value={tp.tracking_expansion}
							/>
						)}
					</div>
				</SectionCard>
			)}

			{tp.additional_observations && (
				<SectionCard title="Observaciones">
					<p className="text-[0.9375rem] leading-7 whitespace-pre-line">
						{tp.additional_observations}
					</p>
				</SectionCard>
			)}

			{tp.commercial_potential && tp.commercial_potential.length > 0 && (
				<SectionCard title="Análisis comercial">
					<FieldChecklist
						label="Potencial clínico-comercial"
						values={tp.commercial_potential}
					/>
				</SectionCard>
			)}

			{hasQuality && (
				<SectionCard title="Espacio de mejora continua">
					<div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
						{tp.quality_information &&
							tp.quality_information.length > 0 && (
								<FieldChecklist
									label="Calidad de la información"
									values={tp.quality_information}
								/>
							)}
						{tp.quality_scan && tp.quality_scan.length > 0 && (
							<FieldChecklist
								label="Calidad de escaneo"
								values={tp.quality_scan}
							/>
						)}
						{tp.quality_xrays && tp.quality_xrays.length > 0 && (
							<FieldChecklist
								label="Calidad de radiografías"
								values={tp.quality_xrays}
							/>
						)}
						{tp.quality_intraoral &&
							tp.quality_intraoral.length > 0 && (
								<FieldChecklist
									label="Calidad de fotos intraorales"
									values={tp.quality_intraoral}
								/>
							)}
						{tp.quality_extraoral &&
							tp.quality_extraoral.length > 0 && (
								<FieldChecklist
									label="Calidad de fotos extraorales"
									values={tp.quality_extraoral}
								/>
							)}
					</div>
				</SectionCard>
			)}
		</div>
	);
}

/** Header de la vista pública: la única pieza oscura de esa pantalla. */
function PublicPlanningHeader({
	planning,
}: {
	planning: TreatmentPlanningRow;
}) {
	// Los dos primeros son números y entran en display; los otros dos son
	// texto libre y a ese tamaño no entrarían.
	const stats = [
		{
			label: "Alineadores sup.",
			value: planning.upper_aligners,
			numeric: true,
		},
		{
			label: "Alineadores inf.",
			value: planning.lower_aligners,
			numeric: true,
		},
		{ label: "Complejidad", value: planning.complexity, numeric: false },
		{ label: "Pronóstico", value: planning.prognosis, numeric: false },
	];

	return (
		<Card variant="invert" className="gap-0 p-6 md:p-8">
			<Eyebrow className="text-primary-foreground/55">
				OrthoPlanner3D
			</Eyebrow>
			<h1 className="mt-2 text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[2rem]">
				Planificación de tratamiento
			</h1>
			<p className="mt-2 text-sm text-primary-foreground/70">
				Detalle del plan de tratamiento ortodóntico
			</p>

			<div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-primary-foreground/10 pt-6 md:grid-cols-4">
				{stats.map((stat) => (
					<div key={stat.label} className="min-w-0">
						<Eyebrow className="text-primary-foreground/55">
							{stat.label}
						</Eyebrow>
						<p
							className={cn(
								"mt-1.5",
								stat.numeric
									? "truncate text-2xl leading-none font-semibold tracking-[-0.02em] tabular-nums"
									: "line-clamp-2 text-base leading-snug font-medium",
							)}
						>
							{stat.value || "—"}
						</p>
					</div>
				))}
			</div>
		</Card>
	);
}

function DataField({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="min-w-0 space-y-1.5">
			<Eyebrow>{label}</Eyebrow>
			<div className="text-[0.9375rem] leading-6 font-medium">
				{value || "No especificado"}
			</div>
		</div>
	);
}
