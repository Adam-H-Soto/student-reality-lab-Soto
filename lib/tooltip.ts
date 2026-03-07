export interface TooltipPlacementInput {
  pointerClientX: number;
  pointerClientY: number;
  containerRect: DOMRect;
  tooltipWidth: number;
  tooltipHeight: number;
  offset?: number;
}

export interface TooltipPlacement {
  left: number;
  top: number;
}

export function getTooltipPlacement(input: TooltipPlacementInput): TooltipPlacement {
  const { pointerClientX, pointerClientY, containerRect, tooltipWidth, tooltipHeight } = input;
  const offset = input.offset ?? 12;

  let left = pointerClientX - containerRect.left + offset;
  let top = pointerClientY - containerRect.top + offset;

  if (left + tooltipWidth > containerRect.width - offset) {
    left = pointerClientX - containerRect.left - tooltipWidth - offset;
  }

  if (top + tooltipHeight > containerRect.height - offset) {
    top = pointerClientY - containerRect.top - tooltipHeight - offset;
  }

  left = Math.max(offset, Math.min(left, containerRect.width - tooltipWidth - offset));
  top = Math.max(offset, Math.min(top, containerRect.height - tooltipHeight - offset));

  return { left, top };
}
