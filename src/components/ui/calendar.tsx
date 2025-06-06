import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "lib/utils";
import "react-day-picker/style.css";

export type CalendarProps = ComponentProps<typeof DayPicker>;

const Calendar = ({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) => {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			animate
			className={cn("p-3 bg-white", className)}
			classNames={{
				...classNames
			}}
			weekStartsOn={1}
			components={{
				PreviousMonthButton: ({ onClick, ...props }) => (
					<button
						{...props}
						onClick={onClick}
						className="p-1 hover:bg-accent rounded-md transition-colors"
						aria-label="Previous month"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
				),
				NextMonthButton: ({ onClick, ...props }) => (
					<button
						{...props}
						onClick={onClick}
						className="p-1 hover:bg-accent rounded-md transition-colors"
						aria-label="Next month"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				)
			}}
			{...props}
		/>
	);
};
Calendar.displayName = "Calendar";

export { Calendar };
