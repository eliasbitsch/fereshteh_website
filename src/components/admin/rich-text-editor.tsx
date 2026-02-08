"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <div className={`rounded-lg border bg-bg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b bg-secondary/20 p-2">
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("bold")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.Bold className="size-4" />
        </Button>
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("italic")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.Italic className="size-4" />
        </Button>
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("underline")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.Underline className="size-4" />
        </Button>
        <div className="mx-1 h-8 w-px bg-border" />
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("insertUnorderedList")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.List className="size-4" />
        </Button>
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("insertOrderedList")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.ListOrdered className="size-4" />
        </Button>
        <div className="mx-1 h-8 w-px bg-border" />
        <Button
          className="h-8 w-8 p-0"
          onPress={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.Link className="size-4" />
        </Button>
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("unlink")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.Unlink className="size-4" />
        </Button>
        <div className="mx-1 h-8 w-px bg-border" />
        <Button
          className="h-8 w-8 p-0"
          onPress={() => execCommand("removeFormat")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icons.RemoveFormatting className="size-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        className={`prose prose-sm min-h-[150px] max-w-none p-4 outline-none ${
          value || isFocused ? "" : "text-muted-fg"
        }`}
        contentEditable
        dangerouslySetInnerHTML={{
          __html: value || (isFocused ? "" : placeholder),
        }}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onInput={handleInput}
        onPaste={handlePaste}
        ref={editorRef}
        suppressContentEditableWarning
      />
    </div>
  );
}

// Simple text area for non-rich text editing
interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className = "",
  rows = 4,
}: TextEditorProps) {
  return (
    <textarea
      className={`w-full min-w-0 resize-y rounded-lg border bg-transparent px-3 py-2 text-fg placeholder-muted-fg outline-none ${className}`}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      value={value}
    />
  );
}
