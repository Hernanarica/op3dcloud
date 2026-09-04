import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useExchangeRates } from "@/hooks/swr/useExchangeRates";
import {
	CURRENCY_COUNTRY_CODES,
	CURRENCY_LABELS,
} from "@/pages/subscription/plans.data";
import { createExchangeRate } from "@/services/supabase/exchange-rate.service";

const CREATABLE_CURRENCIES = ["USD", "EUR"] as const;

const exchangeRateSchema = z.object({
	currency: z.enum(CREATABLE_CURRENCIES),
	month: z.string().min(1, "Seleccioná un mes"),
	rate: z
		.string()
		.min(1, "Ingresá la tasa")
		.refine((value) => Number(value) > 0, "Debe ser mayor a 0"),
});

type ExchangeRateFormValues = z.infer<typeof exchangeRateSchema>;

const UNIQUE_VIOLATION_CODE = "23505";

function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: string }).code === UNIQUE_VIOLATION_CODE
	);
}

export default function CreateExchangeRateDialog() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { mutate } = useExchangeRates();

	const form = useForm<ExchangeRateFormValues>({
		resolver: zodResolver(exchangeRateSchema),
		defaultValues: { currency: "USD", month: "", rate: "" },
	});

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) form.reset();
	}

	async function onSubmit(values: ExchangeRateFormValues) {
		try {
			setIsLoading(true);
			await createExchangeRate({
				currency: values.currency,
				rate: Number(values.rate),
				period: `${values.month}-01`,
			});
			toast.success("Tasa de cambio creada");
			await mutate();
			handleOpenChange(false);
		} catch (error) {
			if (isUniqueViolation(error)) {
				toast.error(
					"Ya existe una tasa cargada para esa moneda en ese mes.",
				);
			} else {
				console.error(error);
				toast.error(
					"No se pudo crear la tasa de cambio. Intentá de nuevo.",
				);
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type="button">
					<PlusIcon />
					Nueva tasa
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nueva tasa de cambio</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="currency"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Moneda</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl className="w-full">
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{CREATABLE_CURRENCIES.map(
												(code) => (
													<SelectItem
														key={code}
														value={code}
													>
														<ReactCountryFlag
															countryCode={
																CURRENCY_COUNTRY_CODES[
																	code
																]
															}
															svg
															style={{
																width: "1em",
																height: "1em",
															}}
															aria-hidden="true"
														/>
														{CURRENCY_LABELS[code]}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FormDescription>
										ARS es la moneda de referencia (1:1), no
										se carga.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="month"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mes de vigencia</FormLabel>
									<FormControl>
										<Input type="month" {...field} />
									</FormControl>
									<FormDescription>
										La tasa se guarda con fecha 1° de ese
										mes.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="rate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Tasa en pesos (por 1 unidad)
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.0001"
											min="0"
											placeholder="Ej: 1500"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? "Guardando..." : "Guardar"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
