import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { makeStyles } from "tss-react/mui";
const useStyles = makeStyles()((theme) => {
  return {
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      backgroundColor: theme.palette.primary.main,
      borderRadius: theme.spacing(2),
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      padding: theme.spacing(4),
      color: theme.palette.primary.contrastText,
      textAlign: "center",
    },
    title: {
      fontWeight: 700,
      fontSize: "3rem",
      margin: theme.spacing(2),
    },
    subtitle: {
      fontSize: "1.5rem",
      margin: theme.spacing(2),
    },
    icon: {
      fontSize: "10rem",
      color: theme.palette.primary.contrastText,
    },
  };
});

function EmptyState() {
  const { classes } = useStyles();

  return (
    <Box className={classes.emptyState}>
      <i className={`fas fa-inbox ${classes.icon}`}></i>
      <Typography variant="h1" className={classes.title}>
        Nothing to see here
      </Typography>
      <Typography variant="h3" className={classes.subtitle}>
        But don't worry, you can add some data and make things happen!
      </Typography>
    </Box>
  );
}

export default EmptyState;
