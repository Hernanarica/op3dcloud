import { FileQuestion } from "lucide-react";
import { useParams } from "react-router";
import { Card } from "@/components/ui/card";
import TreatmentPlanningView from "@/pages/patient/components/TreatmentPlanningView";
import { useTreatmentPlanning } from "@/pages/patient/lib/useTreatmentPlanning";

export default function PublicTreatmentPlanningPage() {
	const { patientId } = useParams<{ patientId: string }>();
	const isValid = Boolean(patientId) && !Number.isNaN(Number(patientId));

	const { data, isLoading } = useTreatmentPlanning(
		isValid ? Number(patientId) : null,
	);

	if (!isValid) {
		return (
			// `svh` y no `vh`: evita el salto por la barra de Safari móvil.
			<div className="flex min-h-svh items-center justify-center p-6">
				<Card
					variant="surface"
					className="items-center gap-4 p-10 text-center"
				>
					<span className="grid size-16 place-items-center rounded-full bg-secondary">
						<FileQuestion className="size-6 text-muted-foreground" />
					</span>
					<div className="space-y-2">
						<h1 className="text-lg font-semibold tracking-[-0.011em]">
							Link no válido
						</h1>
						<p className="max-w-sm text-sm leading-6 text-muted-foreground">
							El identificador del paciente no es correcto. Revisá
							el enlace que te compartieron.
						</p>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-svh bg-background">
			<TreatmentPlanningView
				treatmentPlanning={data}
				isLoading={isLoading}
				isPublic
			/>
		</div>
	);
}
