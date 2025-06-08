import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { Button } from "components/ui/button";
import { Calendar } from "components/ui/calendar";
import { Input } from "components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { cn } from "lib/utils";

interface DateTimePickerProps<T extends FieldValues = FieldValues> {
	control: Control<T>;
	name: Path<T>;
	disabled?: boolean;
}

export function DateTimePicker<T extends FieldValues = FieldValues>({
	control,
	name,
	disabled = false
}: DateTimePickerProps<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className="grid gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!field.value && "text-muted-foreground"
								)}
								disabled={disabled}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{field.value ? (
									format(new Date(field.value), "PPP p")
								) : (
									<span>Pick a date and time</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<div className="bg-white rounded-md">
								<Calendar
									mode="single"
									selected={field.value ? new Date(field.value) : undefined}
									onSelect={(date) => {
										if (date) {
											const currentDate = field.value
												? new Date(field.value)
												: new Date();
											date.setHours(currentDate.getHours());
											date.setMinutes(currentDate.getMinutes());
											field.onChange(date);
										}
									}}
									// className="rounded-t-md border-0"
								/>
								<div className="p-3 border-t bg-white rounded-b-md">
									<div className="flex items-center justify-between space-x-2">
										<Input
											type="time"
											value={
												field.value
													? format(new Date(field.value), "HH:mm")
													: ""
											}
											onChange={(e) => {
												if (e.target.value && field.value) {
													const [hours, minutes] = e.target.value.split(":");
													const date = new Date(field.value);
													date.setHours(parseInt(hours));
													date.setMinutes(parseInt(minutes));
													field.onChange(date);
												}
											}}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												const now = new Date();
												field.onChange(now);
											}}
										>
											Now
										</Button>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			)}
		/>
	);
}
