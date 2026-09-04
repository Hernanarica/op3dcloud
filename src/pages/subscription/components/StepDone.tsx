import { CheckCircle2Icon } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import type { Plan } from "../plans.data";

interface StepDoneProps {
	plan: Plan;
	format: (usdValue: number) => string;
	variant: "receipt" | "partner";
}

export default function StepDone({ plan, format, variant }: StepDoneProps) {
	const navigate = useNavigate();

	const isPartner = variant === "partner";

	return (
		<div className="mx-auto max-w-lg space-y-6 text-center">
			<div className="flex justify-center">
				<CheckCircle2Icon className="text-primary size-16" />
			</div>

			<div className="space-y-2">
				<h2 className="text-foreground text-2xl font-semibold">
					{isPartner
						? "Recibimos tu solicitud"
						: "Tu compra quedó pendiente de aprobación"}
				</h2>
				<p className="text-muted-foreground text-sm">
					{isPartner
						? "Nuestro equipo comercial se pondrá en contacto para diseñar tu acuerdo Partner a medida."
						: "Verificaremos tu transferencia y acreditaremos los créditos en tu cuenta OP3DCloud una vez confirmado el pago."}
				</p>
			</div>

			<div className="bg-muted/50 rounded-lg border p-4 text-left">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">Plan</span>
					<span className="text-foreground text-sm font-medium">
						{plan.name} · {plan.concept}
					</span>
				</div>
				{!isPartner && plan.total != null && (
					<div className="mt-2 flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							Total
						</span>
						<span className="text-foreground text-sm font-medium">
							{format(plan.total)}
						</span>
					</div>
				)}
			</div>

			<Button type="button" onClick={() => navigate("/")}>
				Volver al inicio
			</Button>
		</div>
	);
}
