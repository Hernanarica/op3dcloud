import type { CSSProperties, ReactNode } from "react";
import { AppNavbar } from "@/components/app-navbar";

interface Props {
	children: ReactNode;
}

const NAVBAR_OFFSET =
	"calc(88px - 1.25rem + max(1.25rem, env(safe-area-inset-bottom)))";

export default function PatientLayout({ children }: Props) {
	return (
		<div
			className="relative h-svh w-full overflow-hidden bg-transparent"
			style={{ "--navbar-offset": NAVBAR_OFFSET } as CSSProperties}
		>
			<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center bg-transparent pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
				<AppNavbar className="pointer-events-auto" />
			</div>

			<div className="h-full overflow-auto bg-transparent">
				<div
					className="box-border min-h-full bg-transparent px-4 pt-4"
					style={{ paddingBottom: "var(--navbar-offset)" }}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
