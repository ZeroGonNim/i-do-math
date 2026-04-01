interface Props {
  value: string
}

export function IntegerInput({ value }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="min-w-[160px] min-h-[56px] rounded-xl border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center px-4">
        <span className="text-3xl font-bold tracking-widest text-indigo-800">
          {value || '_'}
        </span>
      </div>
    </div>
  )
}
