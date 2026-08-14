import SearchInput from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PatientsRow } from "@/types/db/patients/patients";
import { EmptyList, EmptySearch } from "./CaseEmpty";
import PatientListItem from "./PatientListItem";

export default function PatientListPanel({
	patients,
	selectedId,
	searchQuery,
	onSearch,
	onSelect,
}: {
	patients: PatientsRow[];
	selectedId?: number | null;
	searchQuery: string;
	onSearch: (query: string) => void;
	onSelect: (patient: PatientsRow) => void;
}) {
	return (
		<Card variant="surface" className="flex max-h-full flex-col gap-0 p-2">
			<div className="shrink-0 space-y-3 px-2 pt-2 pb-3">
				<div className="flex items-center justify-between gap-2">
					<h2 className="text-base font-semibold tracking-[-0.011em]">
						Pacientes
					</h2>
					<Badge variant="soft" className="tabular-nums">
						{patients.length}
					</Badge>
				</div>
				<SearchInput
					onSearch={onSearch}
					placeholder="Buscar paciente..."
					value={searchQuery}
					className="[&_input]:h-10 [&_input]:rounded-full [&_input]:border-transparent [&_input]:bg-secondary"
				/>
			</div>

			<ScrollArea className="min-h-0 flex-1">
				{patients.length > 0 ? (
					// El `key` reinicia la entrada escalonada sólo cuando la
					// lista pasa de vacía a cargada: si dependiera del filtro,
					// re-animaría en cada tecla del buscador.
					<div
						key={patients.length > 0 ? "ready" : "empty"}
						className="space-y-1"
					>
						{patients.map((patient, index) => (
							<PatientListItem
								key={patient.id}
								patient={patient}
								index={index}
								isSelected={selectedId === patient.id}
								onSelect={onSelect}
							/>
						))}
					</div>
				) : searchQuery.trim() ? (
					<EmptySearch query={searchQuery} />
				) : (
					<EmptyList />
				)}
			</ScrollArea>
		</Card>
	);
}
