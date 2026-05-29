import { useState } from "react";
import { Button, Box } from "@mui/material";
import UserInfoModal from "./components/UserInfoModal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Button
        variant="contained"
        size="large"
        onClick={() => setIsModalOpen(true)}
      >
        Complete Your Profile
      </Button>

      <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
}

export default App;
