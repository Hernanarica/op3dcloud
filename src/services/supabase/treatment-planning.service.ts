import { supabase } from "@/config/supabase.config";
import type {
	Tables,
	TablesInsert,
	TablesUpdate,
} from "@/types/db/database.types";

type TreatmentPlanningRow = Tables<
	{ schema: "op3dcloud" },
	"treatment_planning"
>;
type TreatmentPlanningInsert = TablesInsert<
	{ schema: "op3dcloud" },
	"treatment_planning"
>;
type TreatmentPlanningUpdate = TablesUpdate<
	{ schema: "op3dcloud" },
	"treatment_planning"
>;

export async function createTreatmentPlanning(
	data: TreatmentPlanningInsert,
): Promise<TreatmentPlanningRow> {
	try {
		const { data: result, error } = await supabase
			.from("treatment_planning")
			.insert(data)
			.select()
			.single();

		if (error) throw error;

		return result;
	} catch (error) {
		console.error("Error creating treatment planning:", error);
		throw error;
	}
}

export async function getTreatmentPlanningById(
	id: number,
): Promise<TreatmentPlanningRow> {
	try {
		const { data, error } = await supabase
			.from("treatment_planning")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;

		return data;
	} catch (error) {
		console.error("Error getting treatment planning:", error);
		throw error;
	}
}

export async function getTreatmentPlanningByPatientId(
	patientId: number,
): Promise<TreatmentPlanningRow | null> {
	try {
		const { data, error } = await supabase
			.from("treatment_planning")
			.select("*")
			.eq("patient_id", patientId)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) throw error;

		return data;
	} catch (error) {
		console.error("Error getting treatment planning by patient:", error);
		throw error;
	}
}

export async function getAllTreatmentPlanning(): Promise<
	TreatmentPlanningRow[]
> {
	try {
		const { data, error } = await supabase
			.from("treatment_planning")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;

		return data;
	} catch (error) {
		console.error("Error getting all treatment planning:", error);
		throw error;
	}
}

export async function updateTreatmentPlanning(
	id: number,
	data: TreatmentPlanningUpdate,
): Promise<TreatmentPlanningRow> {
	try {
		const { data: result, error } = await supabase
			.from("treatment_planning")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;

		return result;
	} catch (error) {
		console.error("Error updating treatment planning:", error);
		throw error;
	}
}

export async function approveTreatmentPlanning(
	id: number,
): Promise<TreatmentPlanningRow> {
	return updateTreatmentPlanning(id, {
		client_approved: true,
		client_approved_at: new Date().toISOString(),
	});
}

export async function deleteTreatmentPlanning(id: number): Promise<void> {
	try {
		const { error } = await supabase
			.from("treatment_planning")
			.delete()
			.eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error deleting treatment planning:", error);
		throw error;
	}
}
