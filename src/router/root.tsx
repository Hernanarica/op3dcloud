import { createBrowserRouter, Navigate, Outlet } from "react-router";
import PublicLayout from "@/layout/PublicLayout";
import Accesses from "@/pages/accesses";
import ExchangeRates from "@/pages/exchange-rates";
import FormPlanificadorPdf from "@/pages/formPlanificadorPdf";
import Patients from "@/pages/patient";
import CreatePatient from "@/pages/patient/create";
import PatientRegisteredPage from "@/pages/patient-registered";
import Planners from "@/pages/planners";
import PlannersStore from "@/pages/planners/store";
import PrivacyPolicy from "@/pages/privacy";
import Profile from "@/pages/profile";
import Register from "@/pages/register";
import ResetPassword from "@/pages/reset-password";
import SignIn from "@/pages/sign-in";
import SubscriptionPage from "@/pages/subscription";
import TermsAndConditions from "@/pages/terms";
import TreatmentPlanning from "@/pages/treatment-planning";
import PublicTreatmentPlanningPage from "@/pages/treatment-planning-public";
import PrivateGuard from "./guards/PrivateGuard";
import PublicGuard from "./guards/PublicGuard";
import RoleGuard from "./guards/RoleGuard";
import RoleRedirectGuard from "./guards/RoleRedirectGuard";

const router = createBrowserRouter([
	// Public routes
	{
		path: "/",
		element: (
			<PublicGuard>
				<PublicLayout>
					<Outlet />
				</PublicLayout>
			</PublicGuard>
		),
		children: [
			{
				path: "registro",
				element: <Register />,
			},
			{
				index: true,
				path: "inicia-sesion",
				element: <SignIn />,
			},
			{
				path: "form-planificador-pdf",
				element: <FormPlanificadorPdf />,
			},
		],
	},

	// Private routes with role-based access
	{
		path: "/",
		element: (
			<PrivateGuard>
				<Outlet />
			</PrivateGuard>
		),
		children: [
			{
				index: true,
				element: (
					<RoleGuard allowedRoles={["admin", "planner", "client"]}>
						<RoleRedirectGuard />
					</RoleGuard>
				),
			},
			{
				path: "pacientes",
				children: [
					{
						index: true,
						element: (
							<RoleGuard
								allowedRoles={["admin", "planner", "client"]}
							>
								<Patients />
							</RoleGuard>
						),
					},
					{
						path: "crear",
						element: (
							<RoleGuard
								allowedRoles={["admin", "planner", "client"]}
							>
								<CreatePatient />
							</RoleGuard>
						),
					},
				],
			},
			{
				path: "planificadores",
				children: [
					{
						index: true,
						element: (
							<RoleGuard allowedRoles={["admin"]}>
								<Planners />
							</RoleGuard>
						),
					},
					{
						path: "crear",
						element: (
							<RoleGuard allowedRoles={["admin"]}>
								<PlannersStore />
							</RoleGuard>
						),
					},
				],
			},
			{
				path: "accesos",
				element: (
					<RoleGuard allowedRoles={["admin"]}>
						<Accesses />
					</RoleGuard>
				),
			},
			{
				path: "tipos-de-cambio",
				element: (
					<RoleGuard allowedRoles={["admin"]}>
						<ExchangeRates />
					</RoleGuard>
				),
			},
			{
				path: "planificacion-tratamiento",
				element: (
					<RoleGuard allowedRoles={["admin", "planner"]}>
						<TreatmentPlanning />
					</RoleGuard>
				),
			},
			{
				path: "perfil",
				element: (
					<RoleGuard allowedRoles={["admin", "planner", "client"]}>
						<Profile />
					</RoleGuard>
				),
			},
		],
	},
	{
		path: "/dashboard",
		element: (
			<PrivateGuard>
				<RoleGuard allowedRoles={["admin", "planner"]}>
					<Outlet />
				</RoleGuard>
			</PrivateGuard>
		),
		children: [
			{
				index: true,
			},
		],
	},
	{
		path: "/auth/callback",
		element: (
			<PublicGuard>
				<div className="flex min-h-svh items-center justify-center">
					<span>Loading...</span>
				</div>
			</PublicGuard>
		),
	},
	{
		path: "/planificacion/:patientId",
		element: <PublicTreatmentPlanningPage />,
	},
	{
		path: "/pacientes/crear/:clientId",
		element: <CreatePatient />,
	},
	{
		path: "/paciente-registrado",
		element: <PatientRegisteredPage />,
	},
	{
		path: "/reset-password",
		element: <ResetPassword />,
	},
	{
		path: "/terminos-y-condiciones",
		element: <TermsAndConditions />,
	},
	{
		path: "/politica-de-privacidad",
		element: <PrivacyPolicy />,
	},
	{
		path: "/suscripcion",
		element: <SubscriptionPage />,
	},
	{
		path: "*",
		element: <Navigate to="/inicia-sesion" />,
	},
]);

export default router;
