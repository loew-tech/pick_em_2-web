import { Box, CircularProgress } from "@mui/material";

import "./LoadingSpinner.scss";

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner = ({ size = 40 }: LoadingSpinnerProps) => {
  return (
    <Box className="loading-spinner">
      <CircularProgress
        size={size}
        aria-label="Loading"
      />
    </Box>
  );
};

export default LoadingSpinner;