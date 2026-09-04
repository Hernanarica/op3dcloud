import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/config/supabase.config";

interface IFormValues {
	name: string;
	lastname: string;
	email: string;
	password: string;
	confirm_password: string;
}

export default function PlannersStore() {
	const form = useForm<IFormValues>();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	async function onSubmit(values: IFormValues) {
		try {
			// Validate password confirmation
			if (values.password !== values.confirm_password) {
				toast.error("Las contraseñas no coinciden");
				return;
			}

			setIsLoading(true);

			// Sign up with Supabase
			const { data, error } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
				options: {
					data: {
						name: values.name,
						lastname: values.lastname,
						email: values.email,
						role: "planner", // Assuming you want to set a role for planners
						password: values.password,
						confirm_password: values.confirm_password,
					},
				},
			});

			if (error) {
				console.error("Supabase signup error:", error);
				toast.error(error.message || "Error al registrar el usuario");
				return;
			}

			if (data.user) {
				toast.success("Usuario registrado exitosamente");
				// Reset form after successful submission
				form.reset({
					name: "",
					lastname: "",
					email: "",
					password: "",
					confirm_password: "",
				});
			}
		} catch (error) {
			console.error("Form submission error", error);
			toast.error(
				"Error al enviar el formulario. Por favor, inténtalo de nuevo.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-full items-center justify-center">
			<div className="max-w-xl w-full">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 max-w-3xl mx-auto py-10"
					>
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nombre</FormLabel>
											<FormControl>
												<Input
													placeholder="shadcn"
													type="text"
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-6">
								<FormField
									control={form.control}
									name="lastname"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Apellido</FormLabel>
											<FormControl>
												<Input
													placeholder=""
													type="text"
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder=""
											type="email"
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-6">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contraseña</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="Ingresa tu contraseña"
														type={
															showPassword
																? "text"
																: "password"
														}
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() =>
															setShowPassword(
																!showPassword,
															)
														}
													>
														{showPassword ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormDescription>
												Ingresa tu contraseña.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="col-span-6">
								<FormField
									control={form.control}
									name="confirm_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Confirmar contraseña
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="Confirma tu contraseña"
														type={
															showConfirmPassword
																? "text"
																: "password"
														}
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() =>
															setShowConfirmPassword(
																!showConfirmPassword,
															)
														}
													>
														{showConfirmPassword ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormDescription>
												Confirma tu contraseña.
											</FormDescription>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Registrando..." : "Registrar"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
