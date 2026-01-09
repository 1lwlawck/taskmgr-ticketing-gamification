import type { Ref } from 'vue'

export interface DropdownContext {
  open: Ref<boolean>
  align: 'start' | 'center' | 'end'
  toggle: () => void
  close: () => void
  openMenu: () => void
}
