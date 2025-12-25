import { useState, useEffect, useRef } from "react";

interface EditableLabelProps {
  id: string;
  defaultText: string;
  isEditMode: boolean;
  className?: string;
  as?: "span" | "td" | "th" | "div" | "p" | "label";
  style?: React.CSSProperties;
  colSpan?: number;
}

const STORAGE_KEY = "tax_form_text_edits";

// Get all saved text edits
export const getTextEdits = (): Record<string, string> => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
};

// Save a text edit
export const saveTextEdit = (id: string, text: string) => {
  const edits = getTextEdits();
  edits[id] = text;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
};

// Reset all text edits
export const resetAllTextEdits = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const EditableLabel = ({
  id,
  defaultText,
  isEditMode,
  className = "",
  as: Component = "span",
  style,
  colSpan,
}: EditableLabelProps) => {
  const [text, setText] = useState(defaultText);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const edits = getTextEdits();
    if (edits[id]) {
      setText(edits[id]);
    } else {
      setText(defaultText);
    }
  }, [id, defaultText]);

  const handleBlur = () => {
    if (ref.current) {
      const newText = ref.current.innerText.trim();
      if (newText !== defaultText) {
        saveTextEdit(id, newText);
        setText(newText);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  if (!isEditMode) {
    if (Component === "td" || Component === "th") {
      return (
        <Component className={className} style={style} colSpan={colSpan}>
          {text}
        </Component>
      );
    }
    return (
      <Component className={className} style={style}>
        {text}
      </Component>
    );
  }

  // Edit mode - make contentEditable
  if (Component === "td" || Component === "th") {
    return (
      <Component
        ref={ref as React.RefObject<HTMLTableCellElement>}
        className={`${className} cursor-text hover:bg-purple-100 hover:outline hover:outline-1 hover:outline-purple-400 focus:bg-purple-200 focus:outline focus:outline-2 focus:outline-purple-500`}
        style={style}
        colSpan={colSpan}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {text}
      </Component>
    );
  }

  return (
    <Component
      ref={ref as any}
      className={`${className} cursor-text hover:bg-purple-100 hover:outline hover:outline-1 hover:outline-purple-400 focus:bg-purple-200 focus:outline focus:outline-2 focus:outline-purple-500`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {text}
    </Component>
  );
};

export default EditableLabel;
