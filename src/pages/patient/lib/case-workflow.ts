import type { PatientsRow } from "@/types/db/patients/patients";
import type { TreatmentPlanningRow } from "./useTreatmentPlanning";

export type WorkflowStepState = "done" | "current" | "pending";

interface WorkflowStep {
	id: string;
	label: string;
	state: WorkflowStepState;
	/** ISO date, solo cuando el dato existe de verdad. */
	date?: string;
}

/**
 * La documentación se considera completa con los tres grupos que
 * `pages/patient/create.tsx` marca como requeridos, más la declaración jurada.
 * `supplementary_docs` es opcional en el formulario, así que no cuenta.
 */
function hasRequiredDocumentation(patient: PatientsRow): boolean {
	return (
		patient.sworn_declaration &&
		(patient.photos?.length ?? 0) > 0 &&
		(patient.xrays?.length ?? 0) > 0 &&
		(patient.scans?.length ?? 0) > 0
	);
}

/**
 * Estado del caso derivado de los datos que ya existen. No hay tabla de
 * workflow: cada paso se infiere de un campo real.
 *
 * La aprobación vive en `treatment_planning.client_approved`. Hasta que el
 * cliente aprueba, el caso se queda en "Pendiente de aprobación".
 */
export function getCaseWorkflow(
	patient: PatientsRow,
	planning: TreatmentPlanningRow | null,
): WorkflowStep[] {
	const approved = planning?.client_approved === true;

	const steps: WorkflowStep[] = [
		{
			id: "loaded",
			label: "Caso cargado",
			state: "done",
			date: patient.created_at,
		},
		{
			id: "documentation",
			label: "Documentación",
			state: hasRequiredDocumentation(patient) ? "done" : "pending",
		},
		{
			id: "planning",
			label: "En planificación",
			state: planning !== null ? "done" : "pending",
			date: planning?.created_at,
		},
		{
			id: "approval",
			label: approved ? "Aprobada" : "Pendiente de aprobación",
			state: approved ? "done" : "pending",
			date: planning?.client_approved_at ?? undefined,
		},
	];

	return markCurrentStep(steps);
}

/**
 * Marca como `current` al primer paso no completado y deja el resto como
 * estaba. Sin esta pasada podía haber dos pasos actuales a la vez — por
 * ejemplo, un paciente sin declaración jurada al que ya le cargaron la
 * planificación.
 */
function markCurrentStep(steps: WorkflowStep[]): WorkflowStep[] {
	const firstOpen = steps.findIndex((step) => step.state !== "done");
	if (firstOpen === -1) return steps;

	return steps.map((step, index) =>
		index === firstOpen ? { ...step, state: "current" } : step,
	);
}
