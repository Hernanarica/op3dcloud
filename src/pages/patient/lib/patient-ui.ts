/**
 * Helpers de presentación locales a la feature de pacientes.
 */

/** Iniciales del paciente para el Avatar. Ej: ("María", "González") -> "MG" */
export function getInitials(
	name?: string | null,
	lastName?: string | null,
): string {
	const first = name?.trim().charAt(0) ?? "";
	const second = lastName?.trim().charAt(0) ?? "";
	const initials = `${first}${second}`.toUpperCase();
	return initials || "?";
}

/**
 * Clases del badge según el estado del caso. Los valores provienen de
 * CASE_STATUS_OPTIONS en `pages/clients/components/modalEditClient.tsx`.
 */
const CASE_STATUS_CLASSES: Record<string, string> = {
	Prioridad:
		"bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
	Interconsulta:
		"bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200",
	Replanning:
		"bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-200",
	Baja: "bg-neutral-200 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-300",
};

const CASE_STATUS_FALLBACK = "bg-secondary text-secondary-foreground";

export function getCaseStatusClass(status: string): string {
	return CASE_STATUS_CLASSES[status] ?? CASE_STATUS_FALLBACK;
}

/** Color del puntito que acompaña al badge de estado. */
const CASE_STATUS_DOT_CLASSES: Record<string, string> = {
	Prioridad: "bg-amber-500",
	Interconsulta: "bg-sky-500",
	Replanning: "bg-violet-500",
	Baja: "bg-slate-400",
};

export function getCaseStatusDotClass(status: string): string {
	return CASE_STATUS_DOT_CLASSES[status] ?? "bg-muted-foreground";
}

/**
 * Sobre el hero invertido el pastel claro es ilegible: el badge se vuelve
 * translúcido y el color queda a cargo del puntito.
 */
export function getCaseStatusOnInvertClass(): string {
	return "bg-primary-foreground/12 text-primary-foreground";
}

/**
 * Estado de vencimiento del caso, para decidir el color del dato.
 * `null` cuando no hay fecha cargada.
 */
export function getExpirationState(
	expiration?: string | null,
): "expired" | "soon" | "valid" | null {
	if (!expiration) return null;

	const date = new Date(expiration);
	if (Number.isNaN(date.getTime())) return null;

	const days = Math.ceil(
		(date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
	);

	if (days < 0) return "expired";
	if (days <= 30) return "soon";
	return "valid";
}
