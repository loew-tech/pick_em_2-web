import { CircularProgress, Box } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner = ({ size = 40 }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};
export default LoadingSpinner;
