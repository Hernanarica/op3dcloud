import { ArrowLeftIcon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useExchangeRates } from "@/hooks/swr/useExchangeRates";
import {
	CURRENCY_COUNTRY_CODES,
	type CurrencyCode,
} from "@/pages/subscription/plans.data";
import type { ExchangeRateRow } from "@/types/db/exchange-rate/exchange-rate";
import CreateExchangeRateDialog from "./components/CreateExchangeRateDialog";

function formatPeriodLabel(period: string): string {
	const label = new Intl.DateTimeFormat("es-AR", {
		month: "long",
		year: "numeric",
	}).format(new Date(`${period}T00:00:00`));
	return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatRateValue(rate: number): string {
	return new Intl.NumberFormat("es-AR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	}).format(rate);
}

function formatCreatedAt(createdAt: string): string {
	return new Intl.DateTimeFormat("es-AR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(createdAt));
}

function sortRates(rates: ExchangeRateRow[]): ExchangeRateRow[] {
	return [...rates].sort((a, b) => {
		if (a.period !== b.period) return a.period < b.period ? 1 : -1;
		return a.currency.localeCompare(b.currency);
	});
}

export default function ExchangeRates() {
	const { rates, isLoading } = useExchangeRates();
	const sortedRates = sortRates(rates);

	return (
		<div>
			<Button variant="ghost" asChild>
				<Link to="/">
					<ArrowLeftIcon />
				</Link>
			</Button>

			<div className="container mx-auto">
				<div className="space-y-8">
					<div className="flex items-center justify-between gap-4">
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight">
								Tipos de cambio
							</h1>
							<p className="text-muted-foreground">
								Histórico de tasas usadas para convertir los
								precios en /suscripcion
							</p>
						</div>
						<CreateExchangeRateDialog />
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Período</TableHead>
									<TableHead>Moneda</TableHead>
									<TableHead>Tasa (en ARS)</TableHead>
									<TableHead>Cargado el</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="h-24 text-center"
										>
											Cargando tasas...
										</TableCell>
									</TableRow>
								) : sortedRates.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="h-24 text-center"
										>
											Todavía no cargaste ninguna tasa de
											cambio.
										</TableCell>
									</TableRow>
								) : (
									sortedRates.map((rate) => (
										<TableRow key={rate.id}>
											<TableCell>
												{formatPeriodLabel(rate.period)}
											</TableCell>
											<TableCell>
												<span className="flex items-center gap-2">
													<ReactCountryFlag
														countryCode={
															CURRENCY_COUNTRY_CODES[
																rate.currency as CurrencyCode
															]
														}
														svg
														style={{
															width: "1em",
															height: "1em",
														}}
														aria-hidden="true"
													/>
													{rate.currency}
												</span>
											</TableCell>
											<TableCell>
												{formatRateValue(
													Number(rate.rate),
												)}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatCreatedAt(
													rate.created_at,
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</div>
	);
}
