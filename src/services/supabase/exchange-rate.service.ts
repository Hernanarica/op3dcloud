import { supabase } from "@/config/supabase.config";
import type {
	ExchangeRateInsert,
	ExchangeRateRow,
} from "@/types/db/exchange-rate/exchange-rate";

/**
 * Trae todas las tasas de cambio desde op3dcloud.exchange_rate, ordenadas por
 * período descendente. Se lee con el cliente anon (la página de suscripción
 * es pública), lo que depende de la policy "Lectura pública de los tipos de
 * cambio" en la tabla.
 */
export async function getExchangeRates(): Promise<ExchangeRateRow[]> {
	try {
		const { data, error } = await supabase
			.from("exchange_rate")
			.select("*")
			.order("period", { ascending: false });

		if (error) throw error.message;

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

/**
 * Crea una tasa de cambio en op3dcloud.exchange_rate. Requiere el rol admin
 * (policy "Solo el admin edita los tipos de cambio"); Supabase devuelve un
 * error de RLS si lo llama otro rol.
 */
export async function createExchangeRate(
	data: ExchangeRateInsert,
): Promise<ExchangeRateRow> {
	try {
		const { data: result, error } = await supabase
			.from("exchange_rate")
			.insert(data)
			.select()
			.single();

		if (error) throw error;

		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
