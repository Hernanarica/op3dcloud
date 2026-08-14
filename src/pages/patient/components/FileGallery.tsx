import { ExternalLink, File, FileText, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getSignedUrl } from "@/services/supabase/storage.service";
import { Eyebrow } from "./case-ui";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]);

function getFileType(path: string): "image" | "pdf" | "other" {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	if (IMAGE_EXTS.has(ext)) return "image";
	if (ext === "pdf") return "pdf";
	return "other";
}

function getFileName(path: string): string {
	return path.split("/").pop() ?? path;
}

interface FileGalleryProps {
	label: string;
	paths: string[];
}

export function FileGallery({ label, paths }: FileGalleryProps) {
	const [urls, setUrls] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);

	useEffect(() => {
		if (paths.length === 0) return;
		setLoading(true);
		Promise.all(
			paths.map(async (path) => {
				const url = await getSignedUrl(path);
				return [path, url] as const;
			}),
		)
			.then((entries) => setUrls(Object.fromEntries(entries)))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [paths]);

	const selectedUrl = selected ? urls[selected] : null;
	const selectedType = selected ? getFileType(selected) : null;
	const selectedName = selected ? getFileName(selected) : null;

	return (
		<div className="space-y-3">
			<div className="flex items-baseline gap-2">
				<Eyebrow>{label}</Eyebrow>
				<span className="text-xs text-muted-foreground tabular-nums">
					{paths.length}
				</span>
			</div>

			{paths.length === 0 ? (
				<p className="text-sm text-muted-foreground">Sin archivos</p>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
					{loading
						? paths.map((path) => (
								<Skeleton
									key={path}
									className="h-56 rounded-tile"
								/>
							))
						: paths.map((path) => {
								const url = urls[path];
								const type = getFileType(path);
								const name = getFileName(path);

								return (
									<button
										key={path}
										type="button"
										onClick={() => setSelected(path)}
										className="flex h-56 flex-col overflow-hidden rounded-tile bg-card text-left shadow-e1 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-e2 active:translate-y-0 active:scale-[0.98]"
									>
										{/* Preview a sangre: la miniatura es el
										    contenido, el nombre es el pie */}
										<div className="relative flex-1 overflow-hidden bg-secondary/50">
											{type === "image" && url ? (
												<img
													src={url}
													alt={name}
													className="block size-full object-cover"
												/>
											) : type === "pdf" && url ? (
												<iframe
													src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
													title={name}
													className="pointer-events-none block h-[250%] w-[250%] origin-top-left scale-40 border-none"
												/>
											) : (
												<div className="flex size-full items-center justify-center">
													<FileText className="size-8 text-muted-foreground" />
												</div>
											)}
										</div>

										<div className="flex shrink-0 items-center gap-1.5 px-3 py-2.5">
											{type === "pdf" ? (
												<Badge
													variant="soft"
													className="shrink-0 bg-rose-100 px-1.5 text-[10px] text-rose-700 dark:bg-rose-400/15 dark:text-rose-200"
												>
													PDF
												</Badge>
											) : type === "image" ? (
												<ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
											) : (
												<File className="size-3.5 shrink-0 text-muted-foreground" />
											)}
											<span className="flex-1 truncate font-mono text-[11px]">
												{name}
											</span>
										</div>
									</button>
								);
							})}
				</div>
			)}

			<Dialog
				open={selected !== null}
				onOpenChange={(open) => !open && setSelected(null)}
			>
				<DialogContent className="w-full max-w-4xl rounded-panel p-4">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between pr-8">
							<span className="truncate text-sm font-medium">
								{selectedName}
							</span>
							{selectedUrl && (
								<a
									href={selectedUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="ml-2 inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									Abrir
								</a>
							)}
						</DialogTitle>
					</DialogHeader>

					<div className="mt-2">
						{selectedType === "image" && selectedUrl && (
							<img
								src={selectedUrl}
								alt={selectedName ?? ""}
								className="max-h-[75vh] w-full rounded-md object-contain"
							/>
						)}
						{selectedType === "pdf" && selectedUrl && (
							<object
								data={selectedUrl}
								type="application/pdf"
								className="h-[75vh] w-full rounded-md"
							>
								<div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
									<FileText className="h-10 w-10" />
									<p className="text-sm">
										No se puede previsualizar el PDF.{" "}
										<a
											href={selectedUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary underline"
										>
											Abrir en nueva pestaña
										</a>
									</p>
								</div>
							</object>
						)}
						{selectedType === "other" && selectedUrl && (
							<div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
								<File className="h-10 w-10" />
								<a
									href={selectedUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-primary underline"
								>
									Descargar archivo
								</a>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
