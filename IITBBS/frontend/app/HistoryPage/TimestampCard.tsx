import TaskItem from "./TaskItem";

interface Task {
  title: string;
  time: string;
}

interface Props {
  date: string;
  status?: "In Progress" | "Done" | "Overtime";
  tasks?: Task[];
}

export default function TimestampCard({
  date,
  status,
  tasks,
}: Props) {
  const statusColor =
    status === "Done"
      ? "bg-green-100 text-green-700"
      : status === "Overtime"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="border border-blue-900/60 rounded-lg p-4 shadow-md shadow-blue-950 bg-[#02020a]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{date}</span>
          {status && (
            <span className={`text-xs px-2 py-1 rounded font-mono ${statusColor}`}>
              {status}
            </span>
          )}
        </div>
      </div>

      {tasks && (
        <div className="mt-4 space-y-2">
          {tasks.map((task, index) => (
            <TaskItem key={index} {...task} />
          ))}
        </div>
      )}
    </div>
  );
}
