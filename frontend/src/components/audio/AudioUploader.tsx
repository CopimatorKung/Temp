import { useRef, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { Button } from '../ui/Button';

type AudioUploaderProps = {
  disabled?: boolean;
  onRun: (file?: File) => void;
};

export function AudioUploader({ disabled, onRun }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('mock-call.webm');

  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5">
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.webm,audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name ?? 'mock-call.webm');
        }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FiUploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{fileName}</p>
            <p className="text-xs text-muted-foreground">รองรับ mp3, wav, m4a, webm ใช้ mock flow ได้ทันที</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={disabled}>
            เลือกไฟล์
          </Button>
          <Button onClick={() => onRun(inputRef.current?.files?.[0])} disabled={disabled}>
            Run Mock Review
          </Button>
        </div>
      </div>
    </div>
  );
}
