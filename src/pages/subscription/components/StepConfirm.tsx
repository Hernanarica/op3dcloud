import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Plan } from "../plans.data";

interface StepConfirmProps {
	plan: Plan;
	format: (usdValue: number) => string;
	onBack: () => void;
	onConfirm: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-2">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="text-foreground text-sm font-medium">{value}</span>
		</div>
	);
}

export default function StepConfirm({
	plan,
	format,
	onBack,
	onConfirm,
}: StepConfirmProps) {
	return (
		<div className="mx-auto max-w-lg space-y-6">
			<div className="text-center">
				<h2 className="text-foreground text-2xl font-semibold">
					Confirmá tu compra
				</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					Revisá el detalle antes de continuar
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{plan.name}</CardTitle>
					<CardDescription>{plan.concept}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						<SummaryRow
							label="Créditos"
							value={`${plan.credits} ${
								plan.credits === 1 ? "crédito" : "créditos"
							}`}
						/>
						<SummaryRow
							label="Precio por crédito"
							value={`${format(plan.pricePerCredit)} / crédito`}
						/>
						{plan.savingAmount != null && (
							<SummaryRow
								label="Ahorro"
								value={`${format(plan.savingAmount)}${
									plan.savingPercent != null
										? ` · ${plan.savingPercent}%`
										: ""
								}`}
							/>
						)}
						<div className="flex items-center justify-between pt-3">
							<span className="text-foreground text-base font-semibold">
								Total
							</span>
							<span className="text-foreground text-lg font-bold">
								{plan.total != null
									? format(plan.total)
									: "A medida"}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<p className="text-muted-foreground text-center text-xs">
				El pago es manual por transferencia. Al confirmar, te mostramos
				los datos para transferir y subir tu comprobante.
			</p>

			<div className="flex items-center justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Volver
				</Button>
				<Button type="button" onClick={onConfirm}>
					Confirmar compra
				</Button>
			</div>
		</div>
	);
}
