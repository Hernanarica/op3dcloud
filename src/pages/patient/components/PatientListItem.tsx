import { ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import type { PatientsRow } from "@/types/db/patients/patients";
import { getInitials } from "../lib/patient-ui";
import { CaseStatusBadge } from "./case-ui";

export default function PatientListItem({
	patient,
	isSelected,
	onSelect,
	index,
}: {
	patient: PatientsRow;
	isSelected: boolean;
	onSelect: (patient: PatientsRow) => void;
	/** Posición en la lista, para escalonar la entrada. */
	index: number;
}) {
	const statuses = patient.case_status ?? [];

	return (
		<button
			type="button"
			onClick={() => onSelect(patient)}
			className={cn(
				"case-rise w-full rounded-tile p-3 text-left",
				// El feedback ocurre en el pointer-down, no al soltar.
				"transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				isSelected ? "bg-secondary" : "hover:bg-secondary/60",
			)}
			// Más allá de los primeros ítems el escalonado no se percibe y
			// sólo retrasa la interacción.
			style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
		>
			<div className="flex items-start gap-3">
				<Avatar className="size-10 shrink-0">
					<AvatarFallback
						className={cn(
							"text-xs font-semibold",
							isSelected
								? "bg-primary text-primary-foreground"
								: "bg-muted text-foreground",
						)}
					>
						{getInitials(patient.name, patient.last_name)}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1 space-y-1">
					<span className="block truncate text-[0.9375rem] font-medium">
						{patient.name} {patient.last_name}
					</span>

					<p className="truncate text-xs text-muted-foreground">
						{patient.type_of_plan || "Sin plan asignado"} ·{" "}
						{formatDate(patient.created_at)}
					</p>

					{statuses.length > 0 && (
						<div className="flex flex-wrap gap-1 pt-1">
							{statuses.map((status) => (
								<CaseStatusBadge key={status} status={status} />
							))}
						</div>
					)}
				</div>

				<ChevronRightIcon
					className={cn(
						"mt-1.5 size-4 shrink-0",
						isSelected
							? "text-foreground"
							: "text-muted-foreground/60",
					)}
				/>
			</div>
		</button>
	);
}
