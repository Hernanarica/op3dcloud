import { Box, Check, ChevronDown, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getPatientModelSignedUrls } from "@/services/supabase/storage.service";
import {
	type PatientModelCase,
	usePatientModels,
} from "../lib/usePatientModels";

function getFileName(path: string): string {
	return path.split("/").pop() ?? path;
}

function formatCaseDate(iso: string): string {
	return new Date(iso).toLocaleDateString("es-AR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

interface ModelGalleryProps {
	patientId: number;
}

/**
 * Los STL se listan recién cuando el cliente aprueba la planificación. Hasta
 * entonces no se pide el bucket ni se firman URLs.
 */
export function ModelsLockedFallback({
	canApprove,
	isPending,
	onApprove,
}: {
	canApprove: boolean;
	isPending: boolean;
	onApprove: () => void;
}) {
	return (
		<div className="flex flex-col items-center gap-4 p-6 text-center">
			<span className="grid size-16 place-items-center rounded-full bg-secondary">
				<Box className="size-6 text-muted-foreground" />
			</span>
			<div className="space-y-2">
				<h4 className="text-base font-semibold tracking-[-0.011em]">
					Modelos 3D bloqueados
				</h4>
				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					Los modelos 3D se habilitarán cuando apruebes la
					planificación.
				</p>
			</div>
			{canApprove ? (
				<Button size="pill" disabled={isPending} onClick={onApprove}>
					<Check className="size-4" />
					{isPending ? "Aprobando..." : "Aprobar planificación"}
				</Button>
			) : null}
		</div>
	);
}

/**
 * Modelos 3D del paciente, cargados desde la plataforma `stl-render`.
 *
 * No reusa `FileGallery` a propósito: un caso trae un GLB por paso y por arco
 * (fácilmente 40-80 archivos) y los GLB no tienen preview, así que la grilla de
 * tarjetas daría cientos de tiles vacíos. Se agrupa por caso y se colapsa.
 */
export function ModelGallery({ patientId }: ModelGalleryProps) {
	const { cases, isLoading } = usePatientModels(patientId);

	// El título y el contador los pone la `SectionCard` que lo envuelve.
	return (
		<div className="space-y-3">
			{isLoading ? (
				<div className="space-y-2">
					<Skeleton className="h-[4.5rem] rounded-tile" />
					<Skeleton className="h-[4.5rem] rounded-tile" />
				</div>
			) : cases.length === 0 ? (
				<p className="text-sm text-muted-foreground">Sin modelos 3D</p>
			) : (
				<div className="space-y-2">
					{cases.map((item) => (
						<ModelCase key={item.id} modelCase={item} />
					))}
				</div>
			)}
		</div>
	);
}

function ModelCase({ modelCase }: { modelCase: PatientModelCase }) {
	const [open, setOpen] = useState(false);
	const [urls, setUrls] = useState<Record<string, string> | null>(null);
	const [signing, setSigning] = useState(false);

	// Las URLs se firman recién al abrir el caso: un paciente con tres casos no
	// tiene por qué firmar doscientas URLs para mostrar tres renglones cerrados.
	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next || urls !== null || signing || modelCase.files.length === 0) {
			return;
		}

		setSigning(true);
		getPatientModelSignedUrls(modelCase.files)
			.then(setUrls)
			.catch(() => {
				toast.error("Error al generar los enlaces de descarga");
			})
			.finally(() => setSigning(false));
	};

	return (
		<Collapsible
			open={open}
			onOpenChange={handleOpenChange}
			className="overflow-hidden rounded-tile bg-card shadow-e1"
		>
			<CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-secondary/50 active:scale-[0.99]">
				<span className="grid size-10 shrink-0 place-items-center rounded-tile bg-secondary text-foreground">
					<Box className="size-4" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate text-[0.9375rem] font-medium">
						Caso del {formatCaseDate(modelCase.createdAt)}
					</p>
					<p className="text-xs text-muted-foreground tabular-nums">
						{modelCase.files.length}{" "}
						{modelCase.files.length === 1 ? "archivo" : "archivos"}
					</p>
				</div>
				<ChevronDown
					className={cn(
						"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out",
						open && "rotate-180",
					)}
				/>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div className="max-h-72 overflow-y-auto border-t">
					{modelCase.files.length === 0 ? (
						<p className="p-3 text-sm text-muted-foreground">
							El caso no tiene archivos cargados
						</p>
					) : (
						<ul className="divide-y">
							{modelCase.files.map((path) => (
								<ModelFileRow
									key={path}
									path={path}
									url={urls?.[path]}
								/>
							))}
						</ul>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function ModelFileRow({ path, url }: { path: string; url?: string }) {
	const name = getFileName(path);

	return (
		<li className="flex items-center gap-3 px-4 py-2.5">
			<Box className="size-4 shrink-0 text-muted-foreground" />
			<span className="min-w-0 flex-1 truncate font-mono text-xs">
				{name}
			</span>
			{url ? (
				<Button asChild variant="ghost" size="pillSm">
					<a href={url} download={name}>
						<Download className="size-3.5" />
						Descargar
					</a>
				</Button>
			) : (
				<Skeleton className="h-8 w-28 shrink-0 rounded-full" />
			)}
		</li>
	);
}
