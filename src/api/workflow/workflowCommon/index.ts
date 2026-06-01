import { history } from '@umijs/max';
import { normalizePath } from '@/utils/ruoyi';
import type { RouterJumpVO } from './types';

export function routerJump(routerJump: RouterJumpVO) {
  history.push(
    `${normalizePath(routerJump.formPath || '/workflow/leaveEdit/index')}?${new URLSearchParams({
      id: routerJump.businessId,
      type: routerJump.type,
      taskId: String(routerJump.taskId)
    }).toString()}`
  );
}

export default {
  routerJump
};
