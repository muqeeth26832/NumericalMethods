import React from "react";
import { Button, Box } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";

function MatrixUpload({ onFileUpload }: any) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Box my={2}>
      <input
        accept=".csv"
        style={{ display: "none" }}
        id="raised-button-file"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          color="primary"
          component="span"
          startIcon={<CloudUploadIcon />}
        >
          Upload Matrix CSV
        </Button>
      </label>
    </Box>
  );
}

export default MatrixUpload;
