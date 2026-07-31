import { LAYER_DECISION_DISCLAIMER } from '@/lib/disclaimers'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  text?: string
}

export function DisclaimerLine({ className, text = LAYER_DECISION_DISCLAIMER }: Props) {
  return (
    <p
      className={cn(
        'mt-3 border-t border-border pt-3 text-[10px] leading-relaxed text-muted',
        className,
      )}
      role="note"
    >
      {text}
    </p>
  )
}
