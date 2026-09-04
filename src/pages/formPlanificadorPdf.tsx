import {
	Document,
	Image,
	Link,
	Page,
	PDFDownloadLink,
	PDFViewer,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import { useState } from "react";
import logo from "@/assets/images/logos/logo-black.png";
import logoWhite from "@/assets/images/logos/logo-white.png";
import { getTreatmentFilePublicUrl } from "@/services/supabase/storage.service";
import type { Tables } from "@/types/db/database.types";

type TreatmentPlanningRow = Tables<
	{ schema: "op3dcloud" },
	"treatment_planning"
>;

type PatientRow = Tables<{ schema: "op3dcloud" }, "patients">;

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#ffffff",
		padding: 40,
		fontFamily: "Helvetica",
	},
	header: {
		backgroundColor: "#000000",
		padding: 20,
		marginBottom: 30,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 8,
		textAlign: "center",
		letterSpacing: 0.5,
	},
	subtitle: {
		fontSize: 10,
		color: "#ffffff",
		textAlign: "center",
		marginTop: 4,
	},
	watermark: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	watermarkImage: {
		width: 200,
		opacity: 0.06,
	},
	headerLogo: {
		width: 80,
		alignSelf: "center",
		marginTop: 10,
	},
	sectionContainer: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 11,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 8,
		paddingBottom: 4,
		borderBottom: "2px solid #000000",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	card: {
		backgroundColor: "#f8f8f8",
		borderRadius: 4,
		border: "1px solid #e5e5e5",
		padding: 0,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		borderBottom: "1px solid #e5e5e5",
		minHeight: 28,
	},
	rowLast: {
		flexDirection: "row",
		minHeight: 28,
	},
	rowLabel: {
		width: "35%",
		backgroundColor: "#000000",
		padding: 8,
		fontSize: 9,
		fontWeight: "bold",
		color: "#ffffff",
		borderRight: "1px solid #333",
	},
	rowValue: {
		width: "65%",
		padding: 8,
		fontSize: 9,
		color: "#171717",
		backgroundColor: "#ffffff",
	},
	rowValueLink: {
		width: "65%",
		padding: 8,
		fontSize: 9,
		color: "#0000cc",
		backgroundColor: "#ffffff",
		textDecoration: "underline",
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		textAlign: "center",
		fontSize: 8,
		color: "#737373",
		borderTop: "1px solid #e5e5e5",
		paddingTop: 8,
	},
});

interface TreatmentPlanningDocumentProps {
	treatmentPlanning: TreatmentPlanningRow;
	patient: PatientRow;
}

const TreatmentPlanningDocument = ({
	treatmentPlanning,
	patient,
}: TreatmentPlanningDocumentProps) => {
	const tp = treatmentPlanning;

	const arr = (values: string[] | null | undefined) => {
		if (!values || values.length === 0) return "No especificado";
		if (values.length === 1) return values[0];
		return values.map((v) => `• ${v}`).join("\n");
	};

	const hasTracking = [
		tp.tracking_rotations,
		tp.tracking_extrusions,
		tp.tracking_extrusion_buttons,
		tp.tracking_intrusions,
		tp.tracking_torque,
		tp.tracking_angulations,
		tp.tracking_translations,
		tp.tracking_expansion,
	].some(Boolean);

	const hasQuality = [
		tp.quality_information,
		tp.quality_scan,
		tp.quality_xrays,
		tp.quality_intraoral,
		tp.quality_extraoral,
	].some((a) => a && a.length > 0);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>
						PLAN DE TRATAMIENTO DIGITAL
					</Text>
					<Text style={styles.subtitle}>
						OrthoPlanner3D™ | Planificación Ortodóntica Profesional
					</Text>
					<Image style={styles.headerLogo} src={logoWhite} />
				</View>

				{/* Datos del Paciente */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Datos del Paciente</Text>
					<View style={styles.card} wrap={false}>
						<View style={styles.row}>
							<Text style={styles.rowLabel}>Nombre</Text>
							<Text style={styles.rowValue}>{patient.name}</Text>
						</View>
						<View style={styles.rowLast}>
							<Text style={styles.rowLabel}>Apellido</Text>
							<Text style={styles.rowValue}>
								{patient.last_name}
							</Text>
						</View>
					</View>
				</View>

				{/* Assets */}
				{(tp.render_3d || tp.technical_report_url) && (
					<View style={styles.sectionContainer}>
						<View style={styles.card} wrap={false}>
							{tp.render_3d && (
								<View
									style={
										tp.technical_report_url
											? styles.row
											: styles.rowLast
									}
								>
									<Text style={styles.rowLabel}>
										Render 3D
									</Text>
									<Link
										style={styles.rowValueLink}
										src={tp.render_3d ?? ""}
									>
										Ver enlace
									</Link>
								</View>
							)}
							{tp.technical_report_url && (
								<View style={styles.rowLast}>
									<Text style={styles.rowLabel}>
										Informe Técnico
									</Text>
									<Link
										style={styles.rowValueLink}
										src={getTreatmentFilePublicUrl(
											tp.technical_report_url ?? "",
										)}
									>
										Ver enlace
									</Link>
								</View>
							)}
						</View>
					</View>
				)}

				{/* Datos Clínicos */}
				<View style={styles.sectionContainer}>
					<View style={styles.card} wrap={false}>
						<View style={styles.row}>
							<Text style={styles.rowLabel}>
								N Alineadores Max. Superior
							</Text>
							<Text style={styles.rowValue}>
								{tp.upper_aligners ?? "No especificado"}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={styles.rowLabel}>
								N Alineadores Max. Inferior
							</Text>
							<Text style={styles.rowValue}>
								{tp.lower_aligners ?? "No especificado"}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={styles.rowLabel}>Complejidad</Text>
							<Text style={styles.rowValue}>
								{tp.complexity ?? "No especificado"}
							</Text>
						</View>
						<View style={styles.rowLast}>
							<Text style={styles.rowLabel}>Pronóstico</Text>
							<Text style={styles.rowValue}>
								{tp.prognosis ?? "No especificado"}
							</Text>
						</View>
					</View>
				</View>

				{/* Evaluación Clínica */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Evaluación Clínica</Text>
					<View style={styles.card} wrap={false}>
						<View style={styles.rowLast}>
							<Text style={styles.rowLabel}>
								Diagnóstico Presuntivo General
							</Text>
							<Text style={styles.rowValue}>
								{arr(tp.diagnosis)}
							</Text>
						</View>
					</View>
				</View>

				{/* Manufactura */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Manufactura</Text>
					<View style={styles.card} wrap={false}>
						<View style={styles.rowLast}>
							<Text style={styles.rowLabel}>Laboratorio</Text>
							<Text style={styles.rowValue}>
								{arr(tp.laboratory)}
							</Text>
						</View>
					</View>
				</View>

				{/* Plan de Acción */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Plan de Acción</Text>
					<View style={styles.card} wrap={false}>
						<View
							style={
								tp.restrictions && tp.restrictions.length > 0
									? styles.row
									: styles.rowLast
							}
						>
							<Text style={styles.rowLabel}>
								Criterio de Planificación y Accionar Clínico
							</Text>
							<Text style={styles.rowValue}>
								{arr(tp.planning)}
							</Text>
						</View>
						{tp.restrictions && tp.restrictions.length > 0 && (
							<View style={styles.rowLast}>
								<Text style={styles.rowLabel}>
									Restricciones Biomecánicas
								</Text>
								<Text style={styles.rowValue}>
									{arr(tp.restrictions)}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Tracking */}
				{hasTracking && (
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>
							Control de Tracking para Movimientos Complejos
						</Text>
						<View style={styles.card} wrap={false}>
							{tp.tracking_rotations && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Rotaciones
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_rotations}
									</Text>
								</View>
							)}
							{tp.tracking_extrusions && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Extrusiones (controles clínicos)
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_extrusions}
									</Text>
								</View>
							)}
							{tp.tracking_extrusion_buttons && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Extrusiones (botones programados)
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_extrusion_buttons}
									</Text>
								</View>
							)}
							{tp.tracking_intrusions && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Intrusiones
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_intrusions}
									</Text>
								</View>
							)}
							{tp.tracking_torque && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Torque/Inclinaciones
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_torque}
									</Text>
								</View>
							)}
							{tp.tracking_angulations && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Angulaciones
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_angulations}
									</Text>
								</View>
							)}
							{tp.tracking_translations && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Traslaciones
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_translations}
									</Text>
								</View>
							)}
							{tp.tracking_expansion && (
								<View style={styles.rowLast}>
									<Text style={styles.rowLabel}>
										Expansión/Compresión
									</Text>
									<Text style={styles.rowValue}>
										{tp.tracking_expansion}
									</Text>
								</View>
							)}
						</View>
					</View>
				)}

				{/* Observaciones */}
				{tp.additional_observations && (
					<View style={styles.sectionContainer}>
						<View style={styles.card} wrap={false}>
							<View style={styles.rowLast}>
								<Text style={styles.rowLabel}>
									Observaciones Adicionales
								</Text>
								<Text style={styles.rowValue}>
									{tp.additional_observations}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Análisis Comercial */}
				{tp.commercial_potential &&
					tp.commercial_potential.length > 0 && (
						<View style={styles.sectionContainer}>
							<Text style={styles.sectionTitle}>
								Análisis Comercial
							</Text>
							<View style={styles.card} wrap={false}>
								<View style={styles.rowLast}>
									<Text style={styles.rowLabel}>
										Potencial Clínico-Comercial
									</Text>
									<Text style={styles.rowValue}>
										{arr(tp.commercial_potential)}
									</Text>
								</View>
							</View>
						</View>
					)}

				{/* Espacio de Mejora Continua */}
				{hasQuality && (
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>
							Espacio de Mejora Continua
						</Text>
						<View style={styles.card} wrap={false}>
							{tp.quality_information &&
								tp.quality_information.length > 0 && (
									<View style={styles.row}>
										<Text style={styles.rowLabel}>
											Calidad de la Información
										</Text>
										<Text style={styles.rowValue}>
											{arr(tp.quality_information)}
										</Text>
									</View>
								)}
							{tp.quality_scan && tp.quality_scan.length > 0 && (
								<View style={styles.row}>
									<Text style={styles.rowLabel}>
										Calidad de Escaneo
									</Text>
									<Text style={styles.rowValue}>
										{arr(tp.quality_scan)}
									</Text>
								</View>
							)}
							{tp.quality_xrays &&
								tp.quality_xrays.length > 0 && (
									<View style={styles.row}>
										<Text style={styles.rowLabel}>
											Calidad de Radiografías
										</Text>
										<Text style={styles.rowValue}>
											{arr(tp.quality_xrays)}
										</Text>
									</View>
								)}
							{tp.quality_intraoral &&
								tp.quality_intraoral.length > 0 && (
									<View style={styles.row}>
										<Text style={styles.rowLabel}>
											Calidad Fotos Intraorales
										</Text>
										<Text style={styles.rowValue}>
											{arr(tp.quality_intraoral)}
										</Text>
									</View>
								)}
							{tp.quality_extraoral &&
								tp.quality_extraoral.length > 0 && (
									<View style={styles.rowLast}>
										<Text style={styles.rowLabel}>
											Calidad Fotos Extraorales
										</Text>
										<Text style={styles.rowValue}>
											{arr(tp.quality_extraoral)}
										</Text>
									</View>
								)}
						</View>
					</View>
				)}

				{/* Watermark Logo */}
				<View style={styles.watermark} fixed>
					<Image style={styles.watermarkImage} src={logo} />
				</View>

				{/* Footer */}
				<Text style={styles.footer}>
					Documento generado por OrthoPlanner3D™ - Plan de tratamiento
					ortodóntico profesional
				</Text>
			</Page>
		</Document>
	);
};

export { TreatmentPlanningDocument };

const samplePatient: PatientRow = {
	id: 1,
	name: "Juan",
	last_name: "Pérez",
	id_client: "client-123",
	id_planner: "planner-456",
	type_of_plan: "Completo",
	treatment_objective: ["Alineación dental"],
	treatment_approach: "Invisalign",
	declared_limitations: ["Ninguna"],
	dental_restrictions: ["Ninguna"],
	observations_or_instructions: "N/A",
	suggested_adminations_and_actions: ["N/A"],
	sworn_declaration: true,
	planning_enabled: true,
	created_at: new Date().toISOString(),
	case_status: ["En proceso"],
	status: "Activo",
	status_files: ["Completo"],
	notes: null,
	observations: null,
	expiration: null,
	photos: [],
	xrays: [],
	scans: [],
	supplementary_docs: null,
};

const sampleTreatmentPlanning: TreatmentPlanningRow = {
	id: 1,
	patient_id: 1,
	upper_aligners: 14,
	lower_aligners: 12,
	complexity: "Moderada",
	prognosis: "Favorable",
	render_3d: "https://example.com/render-3d",
	technical_report_url: "https://example.com/report",
	diagnosis: [
		"CARIES: Pueden tratarse en paralelo, respetando la anatomía del diente.",
	],
	laboratory: [
		"CASO COMPLEJO: Imprimir por tandas.",
		"CORTE FESTONEADO: Por gingivitis y/o apiñamiento.",
	],
	planning: [
		"ALINEACIÓN Y NIVELACIÓN general.",
		"Mejora de MORDIDA PROFUNDA.",
	],
	restrictions: [
		"ROTACIONES LIMITADAS: Movimientos rotacionales complejos pueden no lograrse completamente.",
	],
	tracking_rotations: "13, 23",
	tracking_extrusions: "21",
	tracking_extrusion_buttons: null,
	tracking_intrusions: null,
	tracking_torque: "11, 21",
	tracking_angulations: null,
	tracking_translations: null,
	tracking_expansion: null,
	commercial_potential: ["Blanqueamiento", "Implantes"],
	quality_information: ["BUENA"],
	quality_scan: ["MUY BUENA"],
	quality_xrays: ["BUENA"],
	quality_intraoral: ["REGULAR"],
	quality_extraoral: ["BUENAS"],
	additional_observations:
		"Paciente colaborador, excelente candidato para tratamiento.",
	client_approved: false,
	client_approved_at: null,
	created_at: new Date().toISOString(),
};

export default function FormPlanificadorPdf() {
	const [showViewer, setShowViewer] = useState(false);

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Generador de Reporte PDF
				</h1>

				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">
						Opciones del PDF
					</h2>
					<div className="flex flex-wrap gap-4">
						<button
							type="button"
							onClick={() => setShowViewer(!showViewer)}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
						>
							{showViewer ? "Ocultar Visor" : "Mostrar Visor PDF"}
						</button>
						<PDFDownloadLink
							document={
								<TreatmentPlanningDocument
									treatmentPlanning={sampleTreatmentPlanning}
									patient={samplePatient}
								/>
							}
							fileName="reporte-planificacion.pdf"
							className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors inline-block text-center"
						>
							{({ loading }) =>
								loading ? "Generando PDF..." : "Descargar PDF"
							}
						</PDFDownloadLink>
					</div>
				</div>

				{showViewer && (
					<div className="bg-white rounded-lg shadow-md p-4">
						<h3 className="text-lg font-semibold mb-4">
							Vista Previa del PDF
						</h3>
						<div className="w-full h-screen border border-gray-200 rounded">
							<PDFViewer width="100%" height="100%">
								<TreatmentPlanningDocument
									treatmentPlanning={sampleTreatmentPlanning}
									patient={samplePatient}
								/>
							</PDFViewer>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
