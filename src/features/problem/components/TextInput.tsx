interface Props {
  value: string
  onChange: (value: string) => void
  isDescriptive?: boolean
}

export function TextInput({ value, onChange, isDescriptive }: Props) {
  return (
    <div className="px-4 py-2">
      <textarea
        className="w-full px-4 py-3 text-base font-medium resize-none leading-relaxed focus:outline-none"
        style={{
          backgroundColor: '#23233f',
          border: '2px solid #23233f',
          color: '#e5e3ff',
          minHeight: isDescriptive ? '140px' : '80px',
          caretColor: '#81ecff',
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={isDescriptive ? '설명을 써 보세요' : '답을 써 보세요'}
        rows={isDescriptive ? 5 : 3}
      />
      {isDescriptive && (
        <p className="text-xs mt-1 text-right" style={{ color: '#aaa8c3' }}>
          자신의 말로 설명해 보세요
        </p>
      )}
    </div>
  )
}
