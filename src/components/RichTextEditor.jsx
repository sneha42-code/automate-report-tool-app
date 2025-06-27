import React from "react";
import { RichTextEditor as MantineRTE } from "@mantine/rte";
//import "@mantine/rte/styles.css";

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <MantineRTE
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sticky={false}
      styles={{
        root: { background: "var(--bg-white)", borderRadius: 8, minHeight: 180 },
      }}
      controls={[
        ["bold", "italic", "underline", "strike"],
        ["h1", "h2", "h3"],
        ["unorderedList", "orderedList"],
        ["blockquote", "code"],
        ["link"],
        ["clean"]
      ]}
    />
  );
};

export default RichTextEditor;
