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
    <div className={`border rounded-lg bg-bg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-secondary/20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("bold")}
          className="h-8 w-8 p-0"
        >
          <Icons.Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("italic")}
          className="h-8 w-8 p-0"
        >
          <Icons.Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("underline")}
          className="h-8 w-8 p-0"
        >
          <Icons.Underline className="size-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <Icons.List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <Icons.ListOrdered className="size-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }}
          className="h-8 w-8 p-0"
        >
          <Icons.Link className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("unlink")}
          className="h-8 w-8 p-0"
        >
          <Icons.Unlink className="size-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={() => execCommand("removeFormat")}
          className="h-8 w-8 p-0"
        >
          <Icons.RemoveFormatting className="size-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        className={`min-h-[150px] p-4 outline-none prose prose-sm max-w-none ${
          !value && !isFocused ? "text-muted-fg" : ""
        }`}
        dangerouslySetInnerHTML={{
          __html: value || (isFocused ? "" : placeholder),
        }}
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full min-w-0 bg-transparent px-3 py-2 text-fg placeholder-muted-fg outline-none border rounded-lg resize-y ${className}`}
    />
  );
}
