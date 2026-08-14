import { PlusIcon, SearchXIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Estados vacíos de la feature. Sin halos ni acentos de color: un círculo
 * neutro, un título y una frase que dice qué hacer.
 */
function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
	size = "default",
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	action?: React.ReactNode;
	className?: string;
	size?: "default" | "lg";
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-4 p-8 text-center",
				className,
			)}
		>
			<span className="grid size-16 place-items-center rounded-full bg-secondary">
				<Icon className="size-6 text-muted-foreground" />
			</span>
			<div className="space-y-2">
				<h3
					className={cn(
						"font-semibold tracking-[-0.011em]",
						size === "lg" ? "text-2xl" : "text-lg",
					)}
				>
					{title}
				</h3>
				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
			{action}
		</div>
	);
}

/** Panel de detalle sin paciente seleccionado. */
export function EmptyPatient() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<EmptyState
				icon={UsersIcon}
				size="lg"
				title="Ningún paciente seleccionado"
				description="Elegí un paciente de la lista para ver el estado del caso, sus datos y la documentación adjunta."
				action={
					<Button asChild variant="soft" size="pill">
						<Link to="/pacientes/crear">
							<PlusIcon className="size-4" /> Crear paciente
						</Link>
					</Button>
				}
			/>
		</div>
	);
}

/** La búsqueda no devolvió resultados. */
export function EmptySearch({ query }: { query: string }) {
	return (
		<EmptyState
			icon={SearchXIcon}
			title="Sin resultados"
			description={`Ningún paciente coincide con "${query}". Probá con otro nombre.`}
		/>
	);
}

/** Todavía no hay pacientes cargados. */
export function EmptyList() {
	return (
		<EmptyState
			icon={UsersIcon}
			title="Sin pacientes"
			description="Cuando cargues el primer paciente va a aparecer acá."
		/>
	);
}
