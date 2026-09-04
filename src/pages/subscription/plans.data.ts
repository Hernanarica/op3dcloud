// Contenido comercial de los planes (PDF "PLANES COMERCIALES _ OP3D™").
// El precio y los créditos son fuente de verdad de op3dcloud.plans: acá quedan
// solo como fallback (si la DB todavía no está sembrada) y el copy comercial
// (concepto, beneficios, label, etc.) que NO vive en la tabla.

import type { ExchangeRateRow } from "@/types/db/exchange-rate/exchange-rate";
import type { PlanRow } from "@/types/db/plans/plans";

export type PlanKey = "case" | "flow" | "scale" | "corp" | "partner";

/** Contenido estático de cada plan, unido a la fila de DB por `name`. */
export interface PlanContent {
	key: PlanKey;
	/** Debe coincidir con plans.name para hacer el match con la DB */
	name: string;
	concept: string;
	description?: string;
	/** Beneficios diferenciales (features de la matriz) */
	benefits: string[];
	/** Etiqueta destacada (ej: "Más elegido") */
	label?: string;
	/** Texto del botón principal */
	cta: string;
	/** true = sin precio cerrado, deriva a "Diseñar acuerdo" (plans.price NULL) */
	custom?: boolean;
	// Fallbacks usados si la DB no devuelve la fila
	fallbackId: number;
	fallbackCredits: number;
	/** Total del plan; null en los custom (Partner) */
	fallbackPrice: number | null;
	/** Precio por crédito de referencia para los custom ("desde X") */
	fromPricePerCredit?: number;
}

/** Plan ya resuelto (DB + contenido) que consume la UI. */
export interface Plan {
	id: number;
	key: PlanKey;
	name: string;
	concept: string;
	/** Créditos incluidos */
	credits: number;
	/** USD por crédito */
	pricePerCredit: number;
	/** Total del plan en USD. null cuando se cotiza a medida (Partner) */
	total: number | null;
	/** Ahorro en USD frente a comprar todo como Case */
	savingAmount?: number;
	/** Ahorro en porcentaje */
	savingPercent?: number;
	label?: string;
	description?: string;
	benefits: string[];
	cta: string;
	custom?: boolean;
}

export const PLAN_CONTENT: PlanContent[] = [
	{
		key: "case",
		name: "Case",
		concept: "1 caso puntual",
		description:
			"Para resolver un caso específico con acceso completo al ecosistema OP3DCloud.",
		benefits: [],
		cta: "Activar acceso",
		fallbackId: 1,
		fallbackCredits: 1,
		fallbackPrice: 64.2,
	},
	{
		key: "flow",
		name: "Flow",
		concept: "Flujo recurrente",
		benefits: [
			"Reporte de consumo",
			"Métricas de performance",
			"Evaluación de potencial de mejora",
		],
		cta: "Activar acceso",
		fallbackId: 2,
		fallbackCredits: 50,
		fallbackPrice: 2889.0,
	},
	{
		key: "scale",
		name: "Scale",
		concept: "Operación a gran escala",
		label: "Más elegido",
		benefits: [
			"Reporte de consumo",
			"Métricas de performance",
			"Evaluación de potencial de mejora",
			"Opción de sesión 1:1 estratégica",
		],
		cta: "Activar acceso",
		fallbackId: 3,
		fallbackCredits: 100,
		fallbackPrice: 5136.0,
	},
	{
		key: "corp",
		name: "Corp",
		concept: "Alto volumen operativo",
		benefits: [
			"Reporte de consumo",
			"Métricas de performance",
			"Evaluación de potencial de mejora",
			"Opción de sesión 1:1 estratégica",
			"Soporte comercial prioritario",
			"Condiciones para operación de alto volumen",
		],
		cta: "Activar acceso",
		fallbackId: 4,
		fallbackCredits: 200,
		fallbackPrice: 8988.0,
	},
	{
		key: "partner",
		name: "Partner",
		concept: "Acuerdo personalizado",
		description:
			"Para laboratorios, clínicas o grupos con volumen estratégico, necesidades específicas o acuerdos personalizados.",
		benefits: [
			"Volumen flexible",
			"Condiciones comerciales a medida",
			"Bonificación de créditos",
			"Ajustes por volumen",
			"Soporte comercial prioritario",
		],
		cta: "Diseñar acuerdo",
		custom: true,
		fallbackId: 5,
		fallbackCredits: 200,
		fallbackPrice: null,
		fromPricePerCredit: 43.84,
	},
];

/**
 * Une las filas de la DB con el contenido estático y calcula los derivados
 * (precio por crédito, total y ahorro vs Case). Si una fila no está en la DB
 * usa los fallbacks, así la página funciona aunque el seed todavía no esté
 * aplicado.
 */
export function buildPlans(rows: PlanRow[]): Plan[] {
	const byName = new Map(rows.map((row) => [row.name, row]));

	// Precio por crédito de Case = base de referencia para el ahorro
	const caseContent = PLAN_CONTENT[0];
	const caseRow = byName.get(caseContent.name);
	const caseCredits = caseRow?.credits ?? caseContent.fallbackCredits;
	const casePrice = caseRow?.price ?? caseContent.fallbackPrice ?? 0;
	const basePricePerCredit = casePrice / caseCredits;

	return PLAN_CONTENT.map((content) => {
		const row = byName.get(content.name);
		const id = row?.id ?? content.fallbackId;
		const credits = row?.credits ?? content.fallbackCredits;

		const base: Omit<
			Plan,
			"pricePerCredit" | "total" | "savingAmount" | "savingPercent"
		> = {
			id,
			key: content.key,
			name: content.name,
			concept: content.concept,
			credits,
			label: content.label,
			description: content.description,
			benefits: content.benefits,
			cta: content.cta,
			custom: content.custom,
		};

		// Custom (Partner): sin precio cerrado ni ahorro
		if (content.custom) {
			return {
				...base,
				pricePerCredit:
					content.fromPricePerCredit ?? basePricePerCredit,
				total: null,
			};
		}

		const total = row?.price ?? content.fallbackPrice ?? 0;
		const pricePerCredit = total / credits;
		const savingPercent = Math.round(
			(1 - pricePerCredit / basePricePerCredit) * 100,
		);
		const savingAmount =
			Math.round((basePricePerCredit - pricePerCredit) * credits * 100) /
			100;

		return {
			...base,
			pricePerCredit,
			total,
			savingPercent: savingPercent > 0 ? savingPercent : undefined,
			savingAmount: savingAmount > 0 ? savingAmount : undefined,
		};
	});
}

// Features diferenciadores en orden de tier. La matriz de las tarjetas marca
// cada uno como incluido (check) o no (guion) según si está en plan.benefits.
export const MASTER_FEATURES: string[] = [
	"Reporte de consumo",
	"Métricas de performance",
	"Evaluación de potencial de mejora",
	"Opción de sesión 1:1 estratégica",
	"Soporte comercial prioritario",
	"Condiciones para operación de alto volumen",
];

export const COMMON_INCLUSIONS: string[] = [
	"Compra única, sin renovación automática",
	"Acceso a OP3DCloud: gestión online de casos",
	"Acceso a OP3DViewer: visualización 3D interactiva",
	"Portfolio integral para uso clínico, digital, técnico y comercial",
	"Vigencia de 12 meses",
];

export const PLANS_FOOTER_NOTE =
	"Todos los planes incluyen acceso a OP3DCloud para la gestión online de casos y acceso a OP3DViewer para visualización 3D.";

export type CurrencyCode = "ARS" | "USD" | "EUR";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
	USD: "Dólares (USD)",
	ARS: "Pesos (ARS)",
	EUR: "Euros (EUR)",
};

/** Código ISO 3166-1 alpha-2 para mostrar la bandera de cada moneda. */
export const CURRENCY_COUNTRY_CODES: Record<CurrencyCode, string> = {
	ARS: "AR",
	USD: "US",
	EUR: "EU",
};

/**
 * Tasa vigente de cada moneda: la fila de mayor `period` cargada en
 * exchange_rate. ARS es la moneda de referencia (así se cargan las tasas:
 * "cuántos ARS cuesta comprar 1 unidad de esa moneda", lo mismo que se lee
 * en una casa de cambio), así que su tasa es siempre 1 aunque no haya fila
 * ARS en la DB. USD/EUR sin tasa cargada quedan `undefined` — a diferencia
 * de defaultear a 1, esto le permite a `useCurrencyFormatter` distinguir
 * "no hay dato" y no calcular un número roto.
 */
export function getLatestRates(
	rows: ExchangeRateRow[],
): Partial<Record<CurrencyCode, number>> {
	const latest: Partial<Record<CurrencyCode, ExchangeRateRow>> = {};
	for (const row of rows) {
		const currency = row.currency as CurrencyCode;
		const current = latest[currency];
		if (!current || row.period > current.period) {
			latest[currency] = row;
		}
	}
	return {
		ARS: 1,
		USD: latest.USD?.rate,
		EUR: latest.EUR?.rate,
	};
}

/**
 * Formatea un valor en la moneda indicada respetando los centavos (PDF,
 * sección 24). Ej: formatCurrency(2889, "USD") -> "USD 2.889,00".
 */
export function formatCurrency(value: number, currency: CurrencyCode): string {
	const formatted = new Intl.NumberFormat("es-AR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
	return `${currency} ${formatted}`;
}
