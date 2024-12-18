import Image from "next/image";
import OutlineEditor from "./components/luminaEditor/outlineEditor";
import { Link } from "@chakra-ui/react";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-start w-full max-w-[100em]">
        <Image
          src={"/LuminaLogo.png"}
          height={571}
          width={533}
          alt="lumina logo"
          style={{
            height: 100,
            width: "auto",
          }}
        />
        {/* <h1 className="text-4xl font-bold text-center sm:text-left">Lumina</h1> */}
        <div className="text-md text-center sm:text-left text-gray-600">
          <p>
            Lumina is a simple and powerful brainstorming tool for college
            application essays. Lumina pushes you to reflect more deeply and
            concretely, and directs you share the parts of your story that
            matter most. For best results, answer the questions with 2-3
            sentence responses, adding as much detail as possible. When you
            press enter, our system will ask you follow up questions. Feel free
            to go in any order, and skip questions as desired.
          </p>
          <br />
          <p>
            Lumina is a work in progress. It is currently in alpha and is
            missing many features. Please provide your feedback!{" "}
            <Link
              href="https://forms.gle/DgpkgeL37SmBkvGx8"
              target="_blank"
              color={"#958DF1"}
              textDecoration={"underline"}
              textUnderlineOffset={2}
            >
              Feedback form
            </Link>
            .
          </p>
        </div>
        <OutlineEditor />
      </main>
    </div>
  );
}
