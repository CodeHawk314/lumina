"use client";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const Review = () => {
  const [outlineReview, setOutlineReview] = useState("");
  return (
    <>
      <Button
        borderColor={"green.600"}
        color={"green.600"}
        borderWidth={2}
        fontWeight={"600"}
        px={8}
        variant={"outline"}
        _hover={{ bg: "green.600", color: "white" }}
      >
        Submit for analysis
      </Button>
      <ReactMarkdown className={"markdown"}>{outlineReview}</ReactMarkdown>
    </>
  );
};

export default Review;
