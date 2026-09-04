import { use, useCallback, useEffect, useState } from "react";
import ModalEditTreatmentPlanning from "@/pages/treatment-planning/components/ModalEditTreatmentPlanning";
import { getDashboardAdmin } from "@/services/supabase/dashboard-admin.service";
import { getPlanners } from "@/services/supabase/planners.service";
import type { DashboardAdminViewRow } from "@/types/db/dashboard-admin/dashboard-admin";
import { createColumns } from "./columns";
import ModalEditClient from "./components/modalEditClient";
import { DataTable } from "./data-table";

const plannersPromise = getPlanners();

export default function Clients() {
	const planners = use(plannersPromise);
	const [data, setData] = useState<DashboardAdminViewRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			const dashboardData = await getDashboardAdmin();
			setData(dashboardData);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleClientUpdated = () => {
		fetchData();
	};

	if (isLoading) {
		return (
			<div className="w-full min-h-full lg:h-full">
				<div className="container mx-auto flex items-center justify-center h-full">
					<div className="text-center">
						<div className="text-sm text-muted-foreground">
							Cargando datos...
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-full lg:h-full">
			<div className="container mx-auto">
				<DataTable
					columns={createColumns()}
					data={data}
					meta={{
						updateData: (
							rowIndex: number,
							columnId: string,
							value: unknown,
						) => {
							setData((prev) =>
								prev.map((row, index) =>
									index === rowIndex
										? { ...row, [columnId]: value }
										: row,
								),
							);
						},
						planners: planners ?? [],
					}}
				/>
				<ModalEditClient onClientUpdated={handleClientUpdated} />
				<ModalEditTreatmentPlanning onPlanningUpdated={fetchData} />
			</div>
		</div>
	);
}
