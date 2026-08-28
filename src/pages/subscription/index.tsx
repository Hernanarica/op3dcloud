import { useState } from "react";
import { toast } from "sonner";
import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@/components/ui/stepper";
import type { CreditPaymentInsert } from "@/types/db/plans/plans";
import StepChoosePlan from "./components/StepChoosePlan";
import StepConfirm from "./components/StepConfirm";
import StepDone from "./components/StepDone";
import StepPartnerForm, {
	type PartnerFormValues,
} from "./components/StepPartnerForm";
import StepReceipt from "./components/StepReceipt";
import type { CurrencyCode, Plan } from "./plans.data";
import { useCurrencyFormatter } from "./useCurrencyFormatter";

// Placeholders: hoy no hay sesión ni catálogo real. Se reemplazan al conectar
// el backend por auth.uid() y el plans.id que devuelva Supabase.
const CLIENT_ID_PLACEHOLDER = "<auth.uid()>";

const FIXED_STEPS = ["Elegí tu plan", "Confirmar", "Comprobante", "Listo"];
const PARTNER_STEPS = ["Elegí tu plan", "Tus datos", "Listo"];

export default function SubscriptionPage() {
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [currency, setCurrency] = useState<CurrencyCode>("USD");
	const { format } = useCurrencyFormatter(currency);

	const isPartner = selectedPlan?.custom === true;
	const steps = isPartner ? PARTNER_STEPS : FIXED_STEPS;

	function handleChoosePlan(plan: Plan) {
		setSelectedPlan(plan);
		// Si cambia entre una rama y la otra, reseteo el comprobante
		setFiles([]);
		setCurrentStep(2);
	}

	function handleConfirm() {
		if (!selectedPlan) return;

		const payload: CreditPaymentInsert = {
			client_id: CLIENT_ID_PLACEHOLDER,
			plan_id: selectedPlan.id,
			credits: selectedPlan.credits ?? 0,
			amount: selectedPlan.total,
			status: "pending",
		};

		console.log("[suscripcion] INSERT op3dcloud.credit_payments", payload);
		toast.success("Compra registrada. Subí tu comprobante para continuar.");
		setCurrentStep(3);
	}

	function handleReceiptSubmit() {
		if (!selectedPlan || files.length === 0) return;

		const file = files[0];
		const ext = file.name.split(".").pop() ?? "";
		const receiptPath = `${CLIENT_ID_PLACEHOLDER}/${crypto.randomUUID()}.${ext}`;

		console.log("[suscripcion] UPLOAD storage payment-receipts", {
			fileName: file.name,
			size: file.size,
			receipt_path: receiptPath,
		});
		console.log(
			"[suscripcion] UPDATE op3dcloud.credit_payments.receipt_path",
			{ receipt_path: receiptPath, status: "pending" },
		);
		toast.success("Comprobante enviado. Tu compra quedó pendiente.");
		setCurrentStep(4);
	}

	function handlePartnerSubmit(values: PartnerFormValues) {
		if (!selectedPlan) return;

		console.log("[suscripcion] Solicitud Partner", {
			tipo: "solicitud_partner",
			plan: selectedPlan.name,
			...values,
		});
		toast.success("Solicitud enviada. Te contactaremos pronto.");
		setCurrentStep(3);
	}

	// Contenido según paso y rama
	function renderStep() {
		if (currentStep === 1) {
			return (
				<StepChoosePlan
					currency={currency}
					format={format}
					onCurrencyChange={setCurrency}
					onChoose={handleChoosePlan}
				/>
			);
		}

		if (!selectedPlan) return null;

		if (isPartner) {
			if (currentStep === 2) {
				return (
					<StepPartnerForm
						plan={selectedPlan}
						onBack={() => setCurrentStep(1)}
						onSubmit={handlePartnerSubmit}
					/>
				);
			}
			return (
				<StepDone
					plan={selectedPlan}
					format={format}
					variant="partner"
				/>
			);
		}

		if (currentStep === 2) {
			return (
				<StepConfirm
					plan={selectedPlan}
					format={format}
					onBack={() => setCurrentStep(1)}
					onConfirm={handleConfirm}
				/>
			);
		}

		if (currentStep === 3) {
			return (
				<StepReceipt
					plan={selectedPlan}
					format={format}
					files={files}
					onFilesChange={setFiles}
					onBack={() => setCurrentStep(2)}
					onSubmit={handleReceiptSubmit}
				/>
			);
		}

		return (
			<StepDone plan={selectedPlan} format={format} variant="receipt" />
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="text-foreground text-3xl font-bold">
					Planes y créditos
				</h1>
				<p className="text-muted-foreground mt-1">OrthoPlanner3D™</p>
			</div>

			<div className="mx-auto mb-10 max-w-2xl">
				<Stepper value={currentStep}>
					{steps.map((label, index) => {
						const step = index + 1;
						return (
							<StepperItem
								key={label}
								step={step}
								disabled
								completed={step < currentStep}
								className="not-last:flex-1"
							>
								<StepperTrigger className="gap-2">
									<StepperIndicator />
									<StepperTitle className="hidden sm:block">
										{label}
									</StepperTitle>
								</StepperTrigger>
								{step < steps.length && <StepperSeparator />}
							</StepperItem>
						);
					})}
				</Stepper>
			</div>

			{renderStep()}
		</div>
	);
}
