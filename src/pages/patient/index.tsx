import { ArrowLeftIcon, PlusIcon, Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPatientsByeCLient } from "@/services/supabase/patients.service";
import { useUserStore } from "@/state/stores/useUserStore";
import type { PatientsRow } from "@/types/db/patients/patients";
import { EmptyPatient } from "./components/CaseEmpty";
import CaseSummary, { CaseActions } from "./components/CaseSummary";
import CaseTabs, { type CaseTab } from "./components/CaseTabs";
import PatientHero from "./components/PatientHero";
import PatientListPanel from "./components/PatientListPanel";
import PatientDetail from "./components/patientDetails";
import TreatmentPlanningView from "./components/TreatmentPlanningView";
import { useTreatmentPlanning } from "./lib/useTreatmentPlanning";

export default function Patients() {
	const user = useUserStore((state) => state.user);
	const [patients, setPatients] = useState<PatientsRow[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPatient, setSelectedPatient] = useState<PatientsRow | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState<CaseTab>("summary");
	// En < md solo se ve un panel por vez: la lista o el detalle.
	const [mobileView, setMobileView] = useState<"list" | "detail">("list");

	// La planificación se carga acá porque la necesitan el resumen del caso,
	// las acciones (PDF) y la pestaña de planificación.
	const { data: planning, isLoading: isLoadingPlanning } =
		useTreatmentPlanning(selectedPatient?.id ?? null);

	const handleCopyLink = () => {
		if (!selectedPatient) return;
		const url = `${window.location.origin}/planificacion/${selectedPatient.id}`;
		navigator.clipboard.writeText(url);
		toast.success("Link de planificación copiado");
	};

	const filteredPatients = searchQuery.trim()
		? patients.filter((patient) => {
				const query = searchQuery.toLowerCase();
				const fullName =
					`${patient.name} ${patient.last_name}`.toLowerCase();

				return fullName.includes(query);
			})
		: patients;

	const handleOnClick = (patient: PatientsRow) => {
		setSelectedPatient(patient);
		setActiveTab("summary");
		setMobileView("detail");
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	useEffect(() => {
		if (user) {
			getPatientsByeCLient(user.id)
				.then((patients) => {
					setPatients(patients);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [user]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-2">
				<Button asChild size="pill">
					<Link to="/pacientes/crear">
						<PlusIcon className="size-4" /> Crear paciente
					</Link>
				</Button>
				<Button
					variant="soft"
					size="pill"
					onClick={() => {
						const url = `${window.location.origin}/pacientes/crear/${user?.id}`;
						navigator.clipboard.writeText(url);
						toast.success("Link de registro copiado");
					}}
				>
					<Share2Icon className="size-4" /> Compartir registro
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-6">
				{/* Panel de lista: acompaña el scroll de la página */}
				<aside
					className={cn(
						"md:sticky md:top-4 md:col-span-5 md:max-h-[calc(100svh-3rem)] lg:col-span-4 xl:col-span-3",
						mobileView === "detail" ? "hidden md:block" : "block",
					)}
				>
					<PatientListPanel
						patients={filteredPatients}
						selectedId={selectedPatient?.id}
						searchQuery={searchQuery}
						onSearch={handleSearch}
						onSelect={handleOnClick}
					/>
				</aside>

				{/* Panel de detalle */}
				<section
					className={cn(
						"flex-col md:col-span-7 lg:col-span-8 xl:col-span-9",
						mobileView === "list" ? "hidden md:flex" : "flex",
					)}
				>
					{selectedPatient ? (
						<div className="flex flex-col gap-6">
							{/* Barra flotante: el contenido scrollea por debajo */}
							<div className="translucent-bar sticky top-0 z-10 -mx-1 bg-background/75 px-1 py-1 backdrop-blur-md md:hidden">
								<Button
									variant="ghost"
									size="sm"
									className="w-fit"
									onClick={() => setMobileView("list")}
								>
									<ArrowLeftIcon className="size-4" /> Volver
								</Button>
							</div>

							<Breadcrumb className="hidden md:block">
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link to="/pacientes">
												Pacientes
											</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>
											{selectedPatient.name}{" "}
											{selectedPatient.last_name}
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>

							{/* El `key` remonta al cambiar de paciente: el hero
							    entra en vez de reescribirse de golpe. */}
							<div
								key={selectedPatient.id}
								className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
							>
								<PatientHero
									patient={selectedPatient}
									planning={planning}
									actions={
										<CaseActions
											patient={selectedPatient}
											planning={planning}
											showViewPlanning={
												selectedPatient.planning_enabled &&
												activeTab !== "planning"
											}
											onViewPlanning={() =>
												setActiveTab("planning")
											}
											onCopyLink={handleCopyLink}
										/>
									}
								/>
							</div>

							<CaseTabs
								activeTab={activeTab}
								onChange={setActiveTab}
								showPlanning={selectedPatient.planning_enabled}
							/>

							{/* Contenido de las pestañas. El `key` remonta al
							    cambiar de paciente o pestaña, así el contenido
							    entra en vez de aparecer de golpe. */}
							<div
								key={`${selectedPatient.id}-${activeTab}`}
								className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out"
							>
								{activeTab === "summary" && (
									<CaseSummary
										patient={selectedPatient}
										planning={planning}
										isLoading={isLoadingPlanning}
									/>
								)}
								{activeTab === "details" && (
									<PatientDetail patient={selectedPatient} />
								)}
								{activeTab === "planning" && (
									<TreatmentPlanningView
										treatmentPlanning={planning}
										isLoading={isLoadingPlanning}
									/>
								)}
							</div>
						</div>
					) : (
						<EmptyPatient />
					)}
				</section>
			</div>
		</div>
	);
}
