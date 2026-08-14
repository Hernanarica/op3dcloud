import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { PatientsRow } from "@/types/db/patients/patients";
import { getCaseWorkflow } from "../lib/case-workflow";
import { getExpirationState, getInitials } from "../lib/patient-ui";
import type { TreatmentPlanningRow } from "../lib/useTreatmentPlanning";
import { CaseStatusBadge, Eyebrow, ProgressBar } from "./case-ui";

/**
 * Identidad del paciente y estado del caso. Es la única superficie oscura de
 * la pantalla: lo demás son cards blancas sobre el canvas gris.
 *
 * Se pinta con `primary` / `primary-foreground` y nunca con blanco o negro
 * literales, así en modo oscuro se invierte sola.
 */
export default function PatientHero({
	patient,
	planning,
	actions,
}: {
	patient: PatientsRow;
	planning: TreatmentPlanningRow | null;
	/** Acciones del caso, renderizadas sobre la superficie invertida. */
	actions?: React.ReactNode;
}) {
	const statuses = patient.case_status ?? [];
	const steps = getCaseWorkflow(patient, planning);
	const doneCount = steps.filter((step) => step.state === "done").length;
	const currentStep = steps.find((step) => step.state === "current");
	const ratio = doneCount / steps.length;

	return (
		<Card variant="invert" className="gap-0 p-6 md:p-8">
			<div className="flex flex-wrap items-start gap-4">
				<Avatar className="size-14 shrink-0 rounded-2xl">
					<AvatarFallback className="rounded-2xl bg-primary-foreground/10 text-base font-medium text-primary-foreground">
						{getInitials(patient.name, patient.last_name)}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<Eyebrow className="text-primary-foreground/55">
						Paciente{" "}
						<span className="font-mono">#{patient.id}</span>
					</Eyebrow>
					<h1 className="mt-1.5 truncate text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[2rem]">
						{patient.name} {patient.last_name}
					</h1>

					{statuses.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{statuses.map((status) => (
								<CaseStatusBadge
									key={status}
									status={status}
									onInvert
								/>
							))}
						</div>
					)}
				</div>

				{actions && (
					<div className="flex shrink-0 flex-wrap gap-2">
						{actions}
					</div>
				)}
			</div>

			{/* Progreso: el único acento de color del hero */}
			<div className="mt-8 space-y-2.5">
				<div className="flex items-baseline justify-between gap-3 text-sm">
					<span className="truncate text-primary-foreground/70">
						Paso {Math.min(doneCount + 1, steps.length)} de{" "}
						{steps.length}
						{currentStep && ` · ${currentStep.label}`}
					</span>
					<span className="shrink-0 font-medium tabular-nums">
						{Math.round(ratio * 100)}%
					</span>
				</div>
				<ProgressBar
					value={ratio}
					className="bg-primary-foreground"
					trackClassName="bg-primary-foreground/15"
				/>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-primary-foreground/10 pt-6 md:grid-cols-4">
				<HeroStat label="Alta" value={formatDate(patient.created_at)} />
				<HeroExpiration expiration={patient.expiration} />
				<HeroStat
					label="Plan"
					value={patient.type_of_plan || "No especificado"}
				/>
				<HeroStat
					label="Estado"
					value={patient.status || "Sin estado"}
				/>
			</div>
		</Card>
	);
}

function HeroStat({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="min-w-0">
			<Eyebrow className="text-primary-foreground/55">{label}</Eyebrow>
			<p
				className={cn(
					"mt-1.5 truncate text-lg leading-tight font-medium tracking-[-0.01em]",
					valueClassName,
				)}
				title={value}
			>
				{value}
			</p>
		</div>
	);
}

/** El vencimiento es el único stat con semántica de urgencia. */
function HeroExpiration({ expiration }: { expiration?: string | null }) {
	const state = getExpirationState(expiration);

	if (!state) {
		return <HeroStat label="Vence" value="Sin fecha" />;
	}

	return (
		<HeroStat
			label="Vence"
			value={formatDate(expiration as string)}
			/* El hero se invierte en oscuro: ahí el fondo es claro y hace
			   falta el tono oscuro del mismo color. */
			valueClassName={cn(
				state === "expired" && "text-rose-300 dark:text-rose-700",
				state === "soon" && "text-amber-300 dark:text-amber-700",
			)}
		/>
	);
}
