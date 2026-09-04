import useSWR, { type SWRConfiguration } from "swr";
import { getExchangeRates } from "@/services/supabase/exchange-rate.service";
import type { ExchangeRateRow } from "@/types/db/exchange-rate/exchange-rate";

/**
 * SWR hook para las tasas de cambio (op3dcloud.exchange_rate).
 *
 * @param config - Configuración opcional de SWR
 * @returns filas de tasas de cambio, estado de carga y error
 *
 * @example
 * ```tsx
 * const { rates, isLoading, error } = useExchangeRates();
 * ```
 */
export function useExchangeRates(
	config?: SWRConfiguration<ExchangeRateRow[], Error>,
) {
	const { data, error, isLoading, mutate } = useSWR<ExchangeRateRow[], Error>(
		"exchange-rates",
		getExchangeRates,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 2000,
			keepPreviousData: true,
			...config,
		},
	);

	return {
		rates: data ?? [],
		isLoading,
		error,
		mutate,
	};
}
