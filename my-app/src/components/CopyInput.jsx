import React from "react";

const CopyInput = () => {
  const value = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied to clipboard: " + value);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="text"
        value={value}
        disabled
        readOnly
        style={{ width: "300px", padding: "5px" }}
      />
      <button onClick={copyText}>Copy</button>
    </div>
  );
};

export default CopyInput;