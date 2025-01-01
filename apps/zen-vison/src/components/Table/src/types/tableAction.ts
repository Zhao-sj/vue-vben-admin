import type {
  ButtonProps,
  dropdownItemProps,
  ElTooltipProps,
  PopconfirmProps,
} from 'element-plus';

interface ActionAuth {
  auth?: string | string[];
  role?: string | string[];
}

type DropdownItemProps = ExtractPropTypes<typeof dropdownItemProps>;

interface PopconfirmEmits {
  confirm?: (e: MouseEvent) => void;
  cancel?: (e: MouseEvent) => void;
}

export interface ActionItem extends ActionAuth, Partial<ButtonProps> {
  label?: string;
  icon?: string;
  title?: string;
  onClick?: () => void;
  popConfirm?: Partial<PopconfirmProps> & { on?: PopconfirmEmits };
  tooltip?: Partial<ElTooltipProps>;
}

export interface ActionDropdownItem
  extends ActionAuth,
    Partial<DropdownItemProps> {
  label?: string;
  icon?: string;
  onClick?: () => void;
}
