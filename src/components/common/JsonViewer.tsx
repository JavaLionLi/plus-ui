import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite';

type ParsedJson =
  | { valid: true; data: Record<string, unknown> | unknown[]; text: string }
  | { valid: false; data?: undefined; text: string };

export interface JsonViewerProps {
  value?: string | unknown;
  maxHeight?: number | string;
  emptyText?: string;
}

function parseJson(value: JsonViewerProps['value'], emptyText: string): ParsedJson {
  if (value === undefined || value === null || value === '') {
    return { valid: false, text: emptyText };
  }
  if (typeof value === 'object') {
    return { valid: true, data: value as Record<string, unknown> | unknown[], text: '' };
  }
  try {
    const data = JSON.parse(String(value)) as unknown;
    if (data && typeof data === 'object') {
      return { valid: true, data: data as Record<string, unknown> | unknown[], text: '' };
    }
    return { valid: false, text: JSON.stringify(data, null, 2) };
  } catch {
    return { valid: false, text: String(value) };
  }
}

export default function JsonViewer({ value, maxHeight = 360, emptyText = '暂无数据' }: JsonViewerProps) {
  const parsed = parseJson(value, emptyText);
  const style = { maxHeight };

  if (parsed.valid) {
    return (
      <div className="json-view-react" style={style}>
        <JsonView data={parsed.data} shouldExpandNode={allExpanded} style={defaultStyles} />
      </div>
    );
  }

  return (
    <pre className="json-view-raw-react" style={style}>
      {parsed.text}
    </pre>
  );
}
