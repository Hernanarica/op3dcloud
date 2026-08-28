import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import type { Plan } from "../plans.data";

interface StepReceiptProps {
	plan: Plan;
	format: (usdValue: number) => string;
	files: File[];
	onFilesChange: (files: File[]) => void;
	onBack: () => void;
	onSubmit: () => void;
}

const TRANSFER_DATA_ARS = [
	{ label: "Tipo de cuenta", value: "Caja de ahorro en pesos argentinos" },
	{ label: "Alias", value: "METALIGN.AR" },
	{ label: "CBU", value: "0070130930004033895883" },
	{ label: "Número de cuenta", value: "4033895-8 130-8" },
	{ label: "CUIL", value: "23-32063769-4" },
];

const TRANSFER_DATA_USD = [
	{
		label: "Tipo de cuenta",
		value: "Caja de ahorro en dólares estadounidenses",
	},
	{ label: "Alias", value: "MetaAlign.us" },
	{ label: "CBU", value: "0070130931004032477904" },
	{ label: "Número de cuenta", value: "4032477-9 130-0" },
	{ label: "CUIL", value: "23-32063769-4" },
];

export default function StepReceipt({
	plan,
	format,
	files,
	onFilesChange,
	onBack,
	onSubmit,
}: StepReceiptProps) {
	async function copyToClipboard(value: string, label: string) {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`${label} copiado`);
		} catch {
			toast.error("No se pudo copiar");
		}
	}

	function renderTransferRows(data: { label: string; value: string }[]) {
		return (
			<div className="divide-y">
				{data.map((row) => (
					<div
						key={row.label}
						className="flex items-center justify-between py-2"
					>
						<span className="text-muted-foreground text-sm">
							{row.label}
						</span>
						<div className="flex items-center gap-2">
							<span className="text-foreground text-sm font-medium">
								{row.value}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-6"
								onClick={() =>
									copyToClipboard(row.value, row.label)
								}
							>
								<CopyIcon className="size-3" />
							</Button>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<div className="text-center">
				<h2 className="text-foreground text-2xl font-semibold">
					Realizá la transferencia
				</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					Transferí {plan.total != null ? format(plan.total) : ""} y
					subí el comprobante para que verifiquemos tu pago.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Cuenta en pesos argentinos (ARS)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{renderTransferRows(TRANSFER_DATA_ARS)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Cuenta en dólares estadounidenses (USD)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{renderTransferRows(TRANSFER_DATA_USD)}
				</CardContent>
			</Card>

			<div className="space-y-2">
				<p className="text-foreground text-sm font-medium">
					Comprobante de transferencia
				</p>
				<FileUpload
					files={files}
					onFilesChange={onFilesChange}
					accept="image/*,application/pdf"
					multiple={false}
				/>
				<p className="text-muted-foreground text-xs">
					Formatos aceptados: imagen o PDF.
				</p>
			</div>

			<div className="flex items-center justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Volver
				</Button>
				<Button
					type="button"
					disabled={files.length === 0}
					onClick={onSubmit}
				>
					Enviar comprobante
				</Button>
			</div>
		</div>
	);
}
