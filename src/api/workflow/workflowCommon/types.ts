export interface RouterJumpVO {
  businessId: string;
  taskId: string | number;
  type: string;
  formCustom: string;
  formPath: string;
}

export interface StartProcessBo {
  businessId: string | number;
  flowCode: string;
  variables: Record<string, unknown>;
  bizExt: Record<string, unknown>;
}
