type EventCardProps = {
  date: string
  time: string
  title: string
  description: string
  darkButton?: boolean
}

export default function AlertCard({
  date,
  time,
  title,
  description,
  darkButton = false,
}: EventCardProps) {
  return (
    <div className={`flex items-center justify-between rounded-xl p-6 shadow-sm text-amber-50 shadow-blue-600 ${darkButton ? 'bg-red-950/40 border border-red-800' : 'bg-gray-800'}`}>
      <div className="flex items-center gap-6">
        <div className={`w-28 h-20 rounded-lg flex flex-col items-center justify-center text-center ${darkButton ? 'bg-red-900 text-white' : 'bg-slate-100 text-gray-800'}`}>
          <span className={`text-xs font-semibold ${darkButton ? 'text-red-200' : 'text-gray-500'}`}>{date}</span>
          <span className="text-xl font-bold">{time}</span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-blue-200">
            {title}
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
