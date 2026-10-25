interface Props {
  title: string;
  time: string;
}

export default function TaskItem({ title, time }: Props) {
  return (
    <div className="flex justify-between items-center border rounded-md px-3 py-2 text-sm bg-gray-900">
      <span>{title}</span>
      <span className="text-blue-300">{time}</span>
    </div>
  );
}
