import { CheckIcon, MinusIcon, SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlans } from "@/hooks/swr/usePlans";
import { cn } from "@/lib/utils";
import {
	buildPlans,
	COMMON_INCLUSIONS,
	CURRENCY_COUNTRY_CODES,
	CURRENCY_LABELS,
	type CurrencyCode,
	MASTER_FEATURES,
	type Plan,
} from "../plans.data";

interface StepChoosePlanProps {
	currency: CurrencyCode;
	format: (usdValue: number) => string;
	onCurrencyChange: (currency: CurrencyCode) => void;
	onChoose: (plan: Plan) => void;
}

/** Precio grande con centavos chicos, reutilizado en tarjeta y banner. */
function PriceTag({
	value,
	format,
	highlighted = false,
}: {
	value: number;
	format: (usdValue: number) => string;
	highlighted?: boolean;
}) {
	const [currencyLabel, amount] = format(value).split(" ");
	const [whole, cents] = amount.split(",");
	return (
		<span className="flex items-baseline gap-1">
			<span
				className={cn(
					"text-sm",
					highlighted
						? "text-background/70"
						: "text-muted-foreground",
				)}
			>
				{currencyLabel}
			</span>
			<span className="text-4xl font-bold tracking-tight tabular-nums">
				{whole}
			</span>
			<span
				className={cn(
					"text-base font-medium",
					highlighted
						? "text-background/70"
						: "text-muted-foreground",
				)}
			>
				,{cents}
			</span>
			<span
				className={cn(
					"text-sm",
					highlighted
						? "text-background/70"
						: "text-muted-foreground",
				)}
			>
				/ crédito
			</span>
		</span>
	);
}

/** Variants del badge "% OFF": entra con spring y luego pulsa en loop. */
function getBadgeVariants(index: number) {
	return {
		hidden: { opacity: 0, transform: "scale(0.5) rotate(-12deg)" },
		enter: {
			opacity: 1,
			transform: "scale(1) rotate(0deg)",
			transition: {
				type: "spring" as const,
				duration: 0.5,
				bounce: 0.35,
				delay: 0.15 + index * 0.06,
			},
		},
		pulse: {
			opacity: 1,
			transform: [
				"scale(1) rotate(0deg)",
				"scale(1.05) rotate(0deg)",
				"scale(1) rotate(0deg)",
			],
			transition: {
				duration: 1.8,
				ease: "easeInOut" as const,
				repeat: Number.POSITIVE_INFINITY,
				repeatDelay: 1.2,
			},
		},
	};
}

function PlanCard({
	plan,
	regularPricePerCredit,
	format,
	onChoose,
	index,
}: {
	plan: Plan;
	regularPricePerCredit: number;
	format: (usdValue: number) => string;
	onChoose: (plan: Plan) => void;
	index: number;
}) {
	const highlighted = Boolean(plan.label);
	const reduceMotion = useReducedMotion();
	const [stage, setStage] = useState<"hidden" | "enter" | "pulse">("hidden");
	const badgeVariants = getBadgeVariants(index);

	useEffect(() => {
		setStage("enter");
	}, []);

	return (
		<div
			className={cn(
				"relative flex flex-col rounded-2xl border p-6 transition-all duration-200",
				highlighted
					? "bg-foreground text-background border-foreground shadow-xl md:-translate-y-2"
					: "bg-card text-card-foreground border-border hover:-translate-y-1 hover:shadow-lg",
			)}
		>
			{highlighted && (
				<Badge className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3 py-1">
					<SparklesIcon className="size-3" />
					Oferta especial · {plan.label}
				</Badge>
			)}

			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div>
					<h3 className="text-xl font-bold">{plan.name}</h3>
					<p
						className={cn(
							"mt-1 text-sm",
							highlighted
								? "text-background/70"
								: "text-muted-foreground",
						)}
					>
						{plan.concept}
					</p>
				</div>
				{plan.savingPercent != null && (
					<Badge
						asChild
						variant="secondary"
						className="shrink-0 border-transparent bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-500"
					>
						<motion.span
							variants={badgeVariants}
							initial="hidden"
							animate={reduceMotion ? "enter" : stage}
							onAnimationComplete={(definition) => {
								if (definition === "enter" && !reduceMotion) {
									setStage("pulse");
								}
							}}
						>
							{plan.savingPercent}% OFF
						</motion.span>
					</Badge>
				)}
			</div>

			{/* Precio */}
			<div className="mt-5 min-h-20">
				{plan.savingPercent != null && (
					<p
						className={cn(
							"text-sm line-through",
							highlighted
								? "text-background/50"
								: "text-muted-foreground",
						)}
					>
						{format(regularPricePerCredit)}
					</p>
				)}
				<PriceTag
					value={plan.pricePerCredit}
					format={format}
					highlighted={highlighted}
				/>
				<p
					className={cn(
						"mt-1 text-sm font-semibold",
						highlighted ? "text-background" : "text-foreground",
					)}
				>
					{plan.total != null && `Total: ${format(plan.total)}`}
				</p>
			</div>

			{/* CTA */}
			<Button
				type="button"
				className={cn(
					"mt-4 w-full",
					highlighted &&
						"bg-background text-foreground hover:bg-background/90",
				)}
				variant={highlighted ? "default" : "outline"}
				onClick={() => onChoose(plan)}
			>
				{plan.cta}
			</Button>

			<p
				className={cn(
					"mt-3 text-center text-xs",
					highlighted
						? "text-background/60"
						: "text-muted-foreground",
				)}
			>
				{plan.credits != null &&
					`${plan.credits} ${plan.credits === 1 ? "crédito" : "créditos"} · vigencia 12 meses`}
			</p>

			<Separator
				className={cn("my-5", highlighted && "bg-background/20")}
			/>

			{/* Ahorro destacado */}
			{plan.savingAmount != null ? (
				<p
					className={cn(
						"mb-3 text-sm font-semibold",
						highlighted ? "text-background" : "text-primary",
					)}
				>
					Ahorrás {format(plan.savingAmount)}
				</p>
			) : (
				<p
					className={cn(
						"mb-3 text-sm",
						highlighted
							? "text-background/70"
							: "text-muted-foreground",
					)}
				>
					{plan.description}
				</p>
			)}

			{/* Matriz de features */}
			<ul className="space-y-2.5">
				{MASTER_FEATURES.map((feature) => {
					const included = plan.benefits.includes(feature);
					return (
						<li
							key={feature}
							className={cn(
								"flex items-start gap-2 text-sm",
								!included &&
									(highlighted
										? "text-background/40"
										: "text-muted-foreground/60"),
							)}
						>
							{included ? (
								<CheckIcon
									className={cn(
										"mt-0.5 size-4 shrink-0",
										highlighted
											? "text-background"
											: "text-primary",
									)}
								/>
							) : (
								<MinusIcon className="mt-0.5 size-4 shrink-0 opacity-50" />
							)}
							<span>{feature}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function PartnerBanner({
	plan,
	format,
	onChoose,
}: {
	plan: Plan;
	format: (usdValue: number) => string;
	onChoose: (plan: Plan) => void;
}) {
	return (
		<div className="from-primary/5 flex flex-col gap-6 rounded-2xl border bg-gradient-to-br to-transparent p-8 md:flex-row md:items-center md:justify-between">
			<div className="max-w-md space-y-2">
				<div className="flex items-center gap-2">
					<h3 className="text-2xl font-bold">{plan.name}</h3>
					<Badge variant="outline">{plan.concept}</Badge>
				</div>
				<p className="text-muted-foreground text-sm">
					{plan.description}
				</p>
				<p className="text-sm">
					<span className="text-muted-foreground">Desde </span>
					<span className="text-lg font-bold">
						{format(plan.pricePerCredit)}
					</span>
					<span className="text-muted-foreground"> / crédito</span>
				</p>
			</div>

			<div className="space-y-4">
				<ul className="grid gap-2 sm:grid-cols-2">
					{plan.benefits.map((benefit) => (
						<li
							key={benefit}
							className="flex items-start gap-2 text-sm"
						>
							<CheckIcon className="text-primary mt-0.5 size-4 shrink-0" />
							<span>{benefit}</span>
						</li>
					))}
				</ul>
				<Button
					type="button"
					size="lg"
					className="w-full md:w-auto"
					onClick={() => onChoose(plan)}
				>
					{plan.cta}
				</Button>
			</div>
		</div>
	);
}

export default function StepChoosePlan({
	currency,
	format,
	onCurrencyChange,
	onChoose,
}: StepChoosePlanProps) {
	const { plans: rows, isLoading } = usePlans();
	const plans = buildPlans(rows);

	const creditPlans = plans.filter((plan) => !plan.custom);
	const partnerPlan = plans.find((plan) => plan.custom);
	const regularPricePerCredit =
		plans.find((plan) => plan.key === "case")?.pricePerCredit ?? 0;

	return (
		<div className="space-y-10">
			<div className="space-y-5 text-center">
				<div>
					<h2 className="text-foreground text-3xl font-bold">
						Elegí tu plan
					</h2>
					<p className="text-muted-foreground mt-2">
						Créditos prepagos · 1 crédito = 1 caso habilitado ·
						compra única
					</p>
				</div>

				<Tabs
					value={currency}
					onValueChange={(value) =>
						onCurrencyChange(value as CurrencyCode)
					}
					className="items-center"
				>
					<TabsList>
						{(Object.keys(CURRENCY_LABELS) as CurrencyCode[]).map(
							(code) => (
								<TabsTrigger
									key={code}
									value={code}
									className="gap-1.5"
								>
									<ReactCountryFlag
										countryCode={
											CURRENCY_COUNTRY_CODES[code]
										}
										svg
										style={{ width: "1em", height: "1em" }}
										aria-hidden="true"
									/>
									{code}
								</TabsTrigger>
							),
						)}
					</TabsList>
				</Tabs>

				<div className="bg-muted/30 mx-auto max-w-3xl rounded-xl border p-5 text-left">
					<p className="text-foreground mb-3 text-center text-sm font-semibold">
						Todos los planes incluyen
					</p>
					<ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
						{COMMON_INCLUSIONS.map((item) => (
							<li
								key={item}
								className="text-muted-foreground flex items-start gap-2 text-sm"
							>
								<CheckIcon className="text-primary mt-0.5 size-4 shrink-0" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-5 pt-3 md:grid-cols-2 xl:grid-cols-4">
				{isLoading && rows.length === 0
					? Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								// biome-ignore lint/suspicious/noArrayIndexKey: placeholders fijos
								key={i}
								className="h-[520px] rounded-2xl"
							/>
						))
					: creditPlans.map((plan, index) => (
							<PlanCard
								key={plan.key}
								plan={plan}
								regularPricePerCredit={regularPricePerCredit}
								format={format}
								onChoose={onChoose}
								index={index}
							/>
						))}
			</div>

			{partnerPlan && (
				<PartnerBanner
					plan={partnerPlan}
					format={format}
					onChoose={onChoose}
				/>
			)}
		</div>
	);
}
