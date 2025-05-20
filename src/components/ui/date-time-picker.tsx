import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@components/ui/popover";
import { Input } from "@components/ui/Input";

interface DateTimePickerProps {
	control: Control;
	name: string;
	disabled?: boolean;
}

export function DateTimePicker({
	control,
	name,
	disabled = false,
}: DateTimePickerProps) {
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
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={new Date(field.value)}
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
								initialFocus
							/>
							<div className="p-3 border-t">
								<div className="flex items-center justify-between space-x-2">
									<Input
										type="time"
										value={
											field.value ? format(new Date(field.value), "HH:mm") : ""
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
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											const now = new Date();
											if (field.value) {
												const date = new Date(field.value);
												date.setHours(now.getHours());
												date.setMinutes(now.getMinutes());
												field.onChange(date);
											} else {
												field.onChange(now);
											}
										}}
									>
										Now
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			)}
		/>
	);
}
