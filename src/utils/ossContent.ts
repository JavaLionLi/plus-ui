import { listByIds } from '@/api/system/oss';

const OSS_MARKER_RE = /oss:\/\/([\w-]+)/g;

export async function resolveOssContent(html: string): Promise<string> {
  if (!html) return html;

  const matches = [...html.matchAll(OSS_MARKER_RE)];
  if (!matches.length) return html;

  const ossIds = [...new Set(matches.map(match => match[1]))];

  try {
    const res = await listByIds(ossIds.join(','));
    let result = html;
    for (const oss of res.data || []) {
      result = result.replaceAll(`oss://${oss.ossId}`, oss.url);
    }
    return result;
  } catch {
    return html;
  }
}
