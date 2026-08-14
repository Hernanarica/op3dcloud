import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PatientsRow } from "@/types/db/patients/patients";
import { Eyebrow, FieldChecklist, SectionCard } from "./case-ui";
import { FileGallery } from "./FileGallery";
import { ModelGallery } from "./ModelGallery";

interface PatientDetailProps {
	patient: PatientsRow;
}

/** Los arrays de Postgres pueden llegar como `{a,b}` en vez de array real. */
function toArray(v: unknown): string[] {
	if (Array.isArray(v)) return v;
	if (typeof v === "string" && v.startsWith("{")) {
		return v
			.slice(1, -1)
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

/**
 * Lectura de los datos que el cliente cargó en el formulario de creación
 * (`pages/patient/create.tsx`). Las secciones, su orden y los labels espejan
 * los 5 pasos de ese formulario para que sea reconocible.
 */
export default function PatientDetail({ patient }: PatientDetailProps) {
	const notes = patient.notes?.trim();
	const observations = patient.observations_or_instructions?.trim();
	const statusFiles = toArray(patient.status_files);

	return (
		<div className="space-y-4 pb-4 md:space-y-6">
			{/* Pasos 1 a 4: en pantallas anchas entran de a dos por fila */}
			<div className="grid items-start gap-4 md:gap-6 xl:grid-cols-2">
				{/* Paso 1 del formulario */}
				<SectionCard step={1} title="Datos iniciales del caso">
					<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
						<FieldValue
							label="Tipo de plan"
							value={patient.type_of_plan}
						/>
						<FieldValue
							label="Enfoque de tratamiento"
							value={patient.treatment_approach}
						/>
					</div>
				</SectionCard>

				{/* Paso 2 del formulario */}
				<SectionCard step={2} title="Objetivos del tratamiento">
					<FieldChecklist
						label="Objetivo del tratamiento"
						values={toArray(patient.treatment_objective)}
					/>
				</SectionCard>

				{/* Paso 3 del formulario */}
				<SectionCard step={3} title="Restricciones y limitaciones">
					<FieldChecklist
						label="Restricciones dentales"
						values={toArray(patient.dental_restrictions)}
					/>
					<FieldChecklist
						label="Limitaciones declaradas"
						values={toArray(patient.declared_limitations)}
					/>
				</SectionCard>

				{/* Paso 4 del formulario */}
				<SectionCard
					step={4}
					title="Aditamentos e instrucciones adicionales"
				>
					<FieldChecklist
						label="Recomendaciones y acciones sugeridas"
						values={toArray(
							patient.suggested_adminations_and_actions,
						)}
					/>
					<FieldText
						label="Observaciones o instrucciones"
						text={patient.observations_or_instructions}
					/>
				</SectionCard>
			</div>

			{/* Notas internas del caso: sólo si hay algo cargado */}
			{(notes || observations) && (
				<SectionCard title="Notas y observaciones">
					{notes && <FieldText label="Notas" text={notes} />}
					{observations && (
						<FieldText
							label="Instrucciones del caso"
							text={observations}
						/>
					)}
				</SectionCard>
			)}

			{/* Paso 5 del formulario. Antes anidaba las galerías dentro de otra
			    card: eran tres niveles de superficie. */}
			<SectionCard
				step={5}
				title="Documentación"
				action={
					statusFiles.length > 0 ? (
						<Badge variant="soft">{statusFiles.join(" · ")}</Badge>
					) : undefined
				}
			>
				<FileGallery label="Fotos" paths={toArray(patient.photos)} />
				<FileGallery
					label="Radiografías"
					paths={toArray(patient.xrays)}
				/>
				<FileGallery label="Escaneos" paths={toArray(patient.scans)} />
				<FileGallery
					label="Documentación complementaria"
					paths={toArray(patient.supplementary_docs)}
				/>
			</SectionCard>

			{/* Vienen de stl-render, no del formulario de creación */}
			<SectionCard title="Modelos 3D">
				<ModelGallery patientId={patient.id} />
			</SectionCard>

			<SectionCard title="Declaración jurada">
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-tile bg-secondary/60 p-4">
					<p className="max-w-md text-sm leading-6 text-muted-foreground">
						El paciente declaró que la información consignada
						reviste carácter de declaración jurada.
					</p>
					{patient.sworn_declaration ? (
						<Badge
							variant="soft"
							className="shrink-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200"
						>
							<CheckCircle className="size-3" />
							Completada
						</Badge>
					) : (
						<Badge
							variant="soft"
							className="shrink-0 bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200"
						>
							<XCircle className="size-3" />
							Pendiente
						</Badge>
					)}
				</div>
			</SectionCard>
		</div>
	);
}

/** Campo que en el formulario es un `Select` de valor único. */
function FieldValue({
	label,
	value,
}: {
	label: string;
	value: string | null | undefined;
}) {
	return (
		<div className="min-w-0 space-y-1.5">
			<Eyebrow>{label}</Eyebrow>
			<p
				className={cn(
					"text-[0.9375rem] leading-6 font-medium",
					!value && "font-normal text-muted-foreground",
				)}
			>
				{value || "No especificado"}
			</p>
		</div>
	);
}

/** Campo que en el formulario es un `Textarea`. */
function FieldText({
	label,
	text,
}: {
	label: string;
	text: string | null | undefined;
}) {
	return (
		<div className="space-y-2">
			<h4 className="text-sm font-medium">{label}</h4>
			{text ? (
				<p className="text-[0.9375rem] leading-7 whitespace-pre-line">
					{text}
				</p>
			) : (
				<p className="rounded-tile bg-secondary/60 p-4 text-sm text-muted-foreground">
					No especificado
				</p>
			)}
		</div>
	);
}
