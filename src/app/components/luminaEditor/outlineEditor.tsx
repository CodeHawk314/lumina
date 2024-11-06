"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import { Color } from "@tiptap/extension-color";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import "./tiptapStyles.css";
import TextStyle from "@tiptap/extension-text-style";
import { KeyboardEventHandler, useState } from "react";
import { parseOutlineJson } from "./outlineparse";
import { selectInitialQuestions } from "@/app/utils/ai";

const OutlineEditor = () => {
  const initialQuestions = selectInitialQuestions(3);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      Bold,
      TextStyle,
      Color,
    ],
    content: `
    <ul>
    ${initialQuestions
      .map(
        (q) => `
        <li><span style="color: #958DF1">${q}</span>
          <ul>
            <li>Student response goes here...</li>
          </ul>
        </li>`
      )
      .join("")}
    </ul>
    `,
    immediatelyRender: false,
  });

  const [aiResp, setAiResp] = useState<string>("");

  // useEffect(() => {
  //   const eventSource = new EventSource("/api/outlineresp");

  //   eventSource.onmessage = (event) => {
  //     console.log(JSON.stringify(event.data));
  //     setAiResp((prev) => prev + event.data);
  //   };

  //   eventSource.onerror = () => {
  //     eventSource.close();
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = async (e) => {
    if (e.key === "Enter") {
      console.log("Enter key pressed");
      const outline = parseOutlineJson(editor?.getJSON() || {});
      console.log(outline);

      // Send outline data with POST
      const response = await fetch("/api/outlineresp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ outline }),
      });

      if (response.ok) {
        // Receive sessionId from the server
        const { sessionId } = await response.json();

        // Open EventSource using the unique sessionId
        const eventSource = new EventSource(
          `/api/outlineresp?sessionId=${sessionId}`
        );

        eventSource.onmessage = (event) => {
          setAiResp((prev) => prev + event.data);
        };

        eventSource.onerror = () => {
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      } else {
        console.error("Failed to send outline JSON");
      }
    }
  };

  return (
    <div
      className="min-h-[40vh] w-full border p-8 border-gray-300 rounded-lg"
      onClick={() => editor?.commands.focus("end")}
    >
      <EditorContent
        editor={editor}
        width={"full"}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      />
      <div>{aiResp}</div>
    </div>
  );
};

export default OutlineEditor;
