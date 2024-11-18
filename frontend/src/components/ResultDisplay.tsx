import React from "react";
import { Typography, Paper, Grid } from "@mui/material";

function ResultDisplay({ results }:any) {
  if (!results) return null;

  return (
    <Grid container spacing={2}>
      {Object.entries(results).map(([key, value]) => (
        <Grid item xs={12} sm={6} key={key}>
          <Paper elevation={3} style={{ padding: "1rem" }}>
            <Typography variant="h6">{key}</Typography>
            {Array.isArray(value) ? (
              value.map((item, index) => (
                <Typography key={index} variant="body2">
                  {typeof item === "object" && item.real !== undefined
                    ? `${item.real}${item.imag >= 0 ? "+" : ""}${item.imag}i` // Complex numbers
                    : JSON.stringify(item)}
                </Typography>
              ))
            ) : typeof value === "object" ? (
              Object.entries(value).map(([subKey, subValue]) => (
                <Typography key={subKey} variant="body2">
                  {`${subKey}: ${JSON.stringify(subValue)}`}
                </Typography>
              ))
            ) : (
              <Typography variant="body1">{String(value)}</Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default ResultDisplay;