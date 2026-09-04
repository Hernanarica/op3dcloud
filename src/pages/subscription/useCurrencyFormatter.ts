import { useMemo } from "react";
import { useExchangeRates } from "@/hooks/swr/useExchangeRates";
import {
	type CurrencyCode,
	formatCurrency,
	getLatestRates,
} from "./plans.data";

/**
 * Centraliza el fetch de tasas de cambio y expone conversión/formateo desde
 * USD (moneda en la que está cotizado plans.price) a la moneda elegida por
 * el cliente. Las tasas se cargan en ARS (moneda de referencia), así que la
 * conversión es una tasa cruzada vía ARS: USD -> ARS -> moneda destino. La
 * conversión es solo visual: no afecta el monto que se registra en
 * credit_payments.
 */
export function useCurrencyFormatter(currency: CurrencyCode) {
	const { rates, isLoading } = useExchangeRates();
	const rateMap = useMemo(() => getLatestRates(rates), [rates]);

	function convert(usdValue: number): number {
		if (currency === "USD") return usdValue;
		const arsPerUsd = rateMap.USD;
		const arsPerCurrency = rateMap[currency];
		if (!arsPerUsd || !arsPerCurrency) return usdValue;
		return (usdValue * arsPerUsd) / arsPerCurrency;
	}

	function format(usdValue: number): string {
		return formatCurrency(convert(usdValue), currency);
	}

	return { convert, format, isLoading };
}
