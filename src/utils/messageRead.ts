const STORAGE_PREFIX = 'plus-ui-react:message-read:';

function storageKey(userId?: string | number) {
  return `${STORAGE_PREFIX}${userId || 'anonymous'}`;
}

export function getReadMessageIds(userId?: string | number) {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(ids.map(String));
  } catch {
    return new Set<string>();
  }
}

export function setReadMessageIds(userId: string | number | undefined, ids: Array<string | number>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify([...new Set(ids.map(String))]));
}

export function markMessageRead(userId: string | number | undefined, messageId?: string | number) {
  if (messageId === undefined || messageId === null) return;
  const ids = getReadMessageIds(userId);
  ids.add(String(messageId));
  setReadMessageIds(userId, [...ids]);
}

export function markMessageReadBatch(
  userId: string | number | undefined,
  messageIds: Array<string | number | undefined | null>
) {
  const ids = getReadMessageIds(userId);
  for (const id of messageIds) {
    if (id !== undefined && id !== null) {
      ids.add(String(id));
    }
  }
  setReadMessageIds(userId, [...ids]);
}
