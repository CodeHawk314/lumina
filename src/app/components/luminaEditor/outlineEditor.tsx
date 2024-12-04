"use client";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
import { Bullet, generateOutlineJson, parseOutlineJson } from "./outlineparse";
import { selectInitialQuestions } from "@/app/utils/ai";
import { Node } from "@tiptap/pm/model";
import { Button } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

const addToOutline = (
  editor: Editor,
  question: string,
  responseNum: number,
  additionText: string
) => {
  // console.log("ADDING TO OUTLINE");
  const jsonContent = editor.getJSON();
  // console.log(jsonContent);

  const outline: Bullet[] = parseOutlineJson(jsonContent);

  // console.log(outline);

  // Helper function to add the node recursively
  const addNodeToOutline = (bullets: Bullet[]): boolean => {
    for (const bullet of bullets) {
      if (bullet.text === question) {
        if (!bullet.subbullets) {
          bullet.subbullets = [];
        }
        if (bullet.subbullets.length > responseNum) {
          if (!bullet.subbullets[responseNum].text) {
            bullet.subbullets[responseNum].text = "";
          }
          bullet.subbullets[responseNum].text += additionText;
          bullet.subbullets[responseNum].author = "LLM";
        } else {
          bullet.subbullets.push({
            text: additionText,
            author: "LLM",
          });
        }
        return true; // Node added, exit recursion
      }
      if (bullet.subbullets && addNodeToOutline(bullet.subbullets)) {
        return true; // Node added in subbullets, exit recursion
      }
    }
    return false; // Node not found in this branch
  };

  if (!addNodeToOutline(outline)) {
    console.error(`Question "${question}" not found in outline.`);
  }

  const newOutline = generateOutlineJson(outline);
  // console.log(newOutline);
  editor.commands.setContent(newOutline);
};

const OutlineEditor = () => {
  const initialQuestions = selectInitialQuestions(3);
  const [outlineReview, setOutlineReview] = useState("");

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

  const isLLMNode = (node: Node): boolean => {
    return (node.marks[0] && Boolean(node.marks[0].attrs.color)) || false;
  };

  const nodeText = (node: Node): string => {
    return node.textContent || "";
  };

  const onSubmitForAnalysis = async () => {
    console.log("submitting...");
    if (editor === null) {
      return;
    }
    setOutlineReview("");
    const jsonContent = editor.getJSON();
    // console.log(jsonContent);
    const outline: Bullet[] = parseOutlineJson(jsonContent);

    // Send outline data with POST
    const response = await fetch("/api/generatereview", {
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
        `/api/generatereview?sessionId=${sessionId}`
      );

      eventSource.onmessage = (event) => {
        const text = event.data.slice(1, -1).replace(/\\n/g, "\n");

        console.log(text);
        setOutlineReview((prevOutlineReview) => prevOutlineReview + text);
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
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = async (e) => {
    if (e.key === "Enter" && editor) {
      // console.log("Enter key pressed");
      const state = editor.view.state;
      const from = state.selection.from;
      const pos = state.doc.resolve(from - 4);
      const node = pos.node();

      if (isLLMNode(node.child(0))) {
        // console.log("resetting marks");
        // reset marks on current node
        editor.commands.unsetMark("textStyle");
        editor.chain().focus().sinkListItem("listItem").run();
        return;
      }
      const currentLine = nodeText(node.child(0));

      const outline = parseOutlineJson(editor.getJSON());

      // Send outline data with POST
      const response = await fetch("/api/outlineresp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ outline, currentLine }),
      });

      if (response.ok) {
        // Receive sessionId from the server
        const { sessionId } = await response.json();

        // Open EventSource using the unique sessionId
        const eventSource = new EventSource(
          `/api/outlineresp?sessionId=${sessionId}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const aiResponse = data.text;
          const question = data.question;
          const bulletNum = data.responseNum;
          addToOutline(editor, question, bulletNum, aiResponse);
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
    <>
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
      </div>
      <Button
        borderColor={"green.600"}
        color={"green.600"}
        borderWidth={2}
        fontWeight={"600"}
        px={8}
        variant={"outline"}
        _hover={{ bg: "green.600", color: "white" }}
        onClick={onSubmitForAnalysis}
      >
        Submit for analysis
      </Button>
      <ReactMarkdown className={"markdown"}>{outlineReview}</ReactMarkdown>
    </>
  );
};

export default OutlineEditor;
