import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatMs } from '../../lib/format';
import type { Transcript } from '../../features/audio-submissions/types';

export function TranscriptViewer({ transcript }: { transcript?: Transcript }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {!transcript ? (
          <p className="text-sm text-muted-foreground">Run mock review เพื่อดู transcript</p>
        ) : (
          transcript.utterances.map((utterance) => (
            <div key={utterance.id} className="rounded-lg border border-border bg-white p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={utterance.speaker === 'sales' ? 'default' : 'muted'}>{utterance.speaker}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatMs(utterance.startMs)} - {formatMs(utterance.endMs)}
                </span>
                <span className="text-xs text-muted-foreground">confidence {Math.round(utterance.confidence * 100)}%</span>
              </div>
              <p className="text-sm leading-6">{utterance.text}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
