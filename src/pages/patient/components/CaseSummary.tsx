import type { DocumentProps } from "@react-pdf/renderer";
import { usePDF } from "@react-pdf/renderer";
import {
	Box,
	Calendar,
	Check,
	Download,
	FileBarChart,
	FileText,
	FolderOpen,
	Gauge,
	Layers,
	Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { TreatmentPlanningDocument } from "@/pages/formPlanificadorPdf";
import { getTreatmentFilePublicUrl } from "@/services/supabase/storage.service";
import type { PatientsRow } from "@/types/db/patients/patients";
import { getCaseWorkflow, type WorkflowStepState } from "../lib/case-workflow";
import type { TreatmentPlanningRow } from "../lib/useTreatmentPlanning";
import { ActionRow, ProgressBar, SectionCard, StatTile } from "./case-ui";

interface CaseProps {
	patient: PatientsRow;
	planning: TreatmentPlanningRow | null;
	isLoading: boolean;
}

export default function CaseSummary({
	patient,
	planning,
	isLoading,
}: CaseProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 md:space-y-6">
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={k} className="h-32 rounded-card" />
					))}
				</div>
				<div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
					<Skeleton className="h-64 rounded-card lg:col-span-2" />
					<Skeleton className="h-64 rounded-card" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6">
			<CaseKpis patient={patient} planning={planning} />

			<div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<CaseWorkflow patient={patient} planning={planning} />
				</div>
				<CaseResources planning={planning} />
			</div>
		</div>
	);
}

/* ── KPIs clínicos ─────────────────────────────────────────────────────── */

function CaseKpis({
	patient,
	planning,
}: {
	patient: PatientsRow;
	planning: TreatmentPlanningRow | null;
}) {
	const aligners = planning
		? planning.upper_aligners + planning.lower_aligners
		: null;

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatTile
				icon={Layers}
				label="Alineadores"
				value={aligners !== null ? String(aligners) : "Pendiente"}
				hint={
					planning
						? `Sup. ${planning.upper_aligners} · Inf. ${planning.lower_aligners}`
						: undefined
				}
				muted={aligners === null}
			/>
			<StatTile
				icon={Gauge}
				label="Complejidad"
				value={planning?.complexity || "Pendiente"}
				muted={!planning?.complexity}
			/>
			<StatTile
				icon={FolderOpen}
				label="Tipo de caso"
				value={patient.type_of_plan}
				muted={!patient.type_of_plan}
			/>
			<StatTile
				icon={Calendar}
				label="Actualizado"
				value={formatDate(planning?.created_at ?? patient.created_at)}
				muted
			/>
		</div>
	);
}

/* ── Workflow ──────────────────────────────────────────────────────────── */

function CaseWorkflow({
	patient,
	planning,
}: {
	patient: PatientsRow;
	planning: TreatmentPlanningRow | null;
}) {
	const steps = getCaseWorkflow(patient, planning);
	const doneCount = steps.filter((step) => step.state === "done").length;

	return (
		<SectionCard
			title="Progreso del caso"
			action={
				<span className="shrink-0 text-3xl leading-none font-semibold tracking-[-0.02em] tabular-nums">
					{doneCount}
					<span className="text-muted-foreground">
						/{steps.length}
					</span>
				</span>
			}
		>
			<ProgressBar value={doneCount / steps.length} />

			<ol className="grid gap-4 md:grid-cols-4">
				{steps.map((step, index) => (
					<li
						key={step.id}
						className={cn(
							"relative flex items-start gap-3 md:block",
							// Conector: una línea detrás del círculo, hasta la
							// celda siguiente. La última no lleva.
							index < steps.length - 1 &&
								"md:after:absolute md:after:top-[1.125rem] md:after:left-[calc(2.25rem+0.5rem)] md:after:h-0.5 md:after:w-[calc(100%-2.25rem)] md:after:rounded-full",
							index < steps.length - 1 &&
								(steps[index + 1]?.state === "done"
									? "md:after:bg-foreground"
									: "md:after:bg-secondary"),
						)}
					>
						<StepCircle state={step.state} />
						<div className="min-w-0 md:mt-3">
							<p
								className={cn(
									"text-sm font-medium",
									step.state === "pending"
										? "text-muted-foreground"
										: "text-foreground",
								)}
							>
								{step.label}
							</p>
							{step.date && (
								<p className="text-xs text-muted-foreground tabular-nums">
									{formatDate(step.date)}
								</p>
							)}
						</div>
					</li>
				))}
			</ol>

			<p className="rounded-tile bg-secondary/60 p-4 text-xs leading-5 text-muted-foreground">
				<span className="font-medium text-foreground">
					Documentación
				</span>{" "}
				se completa con fotos, radiografías y escaneos cargados más la
				declaración jurada.{" "}
				<span className="font-medium text-foreground">
					En planificación
				</span>
				, cuando el planificador guarda el formulario del caso.
			</p>
		</SectionCard>
	);
}

/**
 * Los tres estados se distinguen por relleno y no por color: completado es
 * sólido, el actual va contorneado y el pendiente en gris. Así funciona
 * igual en claro y en oscuro, y para quien no distingue colores.
 */
function StepCircle({ state }: { state: WorkflowStepState }) {
	return (
		<span
			className={cn(
				"relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full",
				state === "done" && "bg-foreground text-background",
				state === "current" &&
					"bg-card text-foreground ring-2 ring-foreground",
				state === "pending" && "bg-secondary text-muted-foreground",
			)}
		>
			{state === "done" ? (
				<Check className="size-4" />
			) : (
				<span className="size-2 rounded-full bg-current" />
			)}
		</span>
	);
}

/* ── Recursos del caso ─────────────────────────────────────────────────── */

function CaseResources({
	planning,
}: {
	planning: TreatmentPlanningRow | null;
}) {
	const reportUrl = planning?.technical_report_url;

	return (
		<SectionCard title="Recursos del caso" className="gap-3">
			<div className="-mx-1 space-y-0.5">
				<ActionRow
					icon={Box}
					title="Planificación 3D"
					hint="Render interactivo"
					href={planning?.render_3d}
					emptyLabel="Todavía no disponible"
				/>
				<ActionRow
					icon={FileBarChart}
					title="Informe técnico"
					hint="Documento del planificador"
					href={
						reportUrl ? getTreatmentFilePublicUrl(reportUrl) : null
					}
					emptyLabel="Todavía no disponible"
				/>
			</div>
		</SectionCard>
	);
}

/* ── Acciones del caso ─────────────────────────────────────────────────── */

/**
 * Van dentro del hero, sobre la superficie invertida: por eso los colores
 * salen de `primary-foreground` y no de blanco literal.
 */
export function CaseActions({
	patient,
	planning,
	showViewPlanning,
	onViewPlanning,
	onCopyLink,
}: {
	patient: PatientsRow;
	planning: TreatmentPlanningRow | null;
	showViewPlanning: boolean;
	onViewPlanning: () => void;
	onCopyLink: () => void;
}) {
	return (
		<>
			<Button variant="inverse" size="pillSm" onClick={onCopyLink}>
				<Link2 className="size-4" />
				Copiar link
			</Button>
			{showViewPlanning && (
				<Button
					variant="ghost"
					size="pillSm"
					className="text-primary-foreground hover:bg-primary-foreground/12 hover:text-primary-foreground"
					onClick={onViewPlanning}
				>
					<FileText className="size-4" />
					Ver planificación
				</Button>
			)}
			{planning && (
				<PDFDownloadButton
					doc={
						<TreatmentPlanningDocument
							treatmentPlanning={planning}
							patient={patient}
						/>
					}
					fileName={`planificacion-${patient.name}-${patient.last_name}.pdf`}
				/>
			)}
		</>
	);
}

function PDFDownloadButton({
	doc,
	fileName,
}: {
	doc: React.ReactElement<DocumentProps>;
	fileName: string;
}) {
	const [instance] = usePDF({ document: doc });

	const handleDownload = () => {
		if (!instance.url) return;
		const a = window.document.createElement("a");
		a.href = instance.url;
		a.download = fileName;
		a.click();
	};

	return (
		<Button
			variant="ghost"
			size="pillSm"
			className="text-primary-foreground hover:bg-primary-foreground/12 hover:text-primary-foreground"
			disabled={instance.loading || !!instance.error}
			onClick={handleDownload}
		>
			<Download className="size-4" />
			{instance.loading ? "Generando..." : "PDF"}
		</Button>
	);
}
