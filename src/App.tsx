import { useState } from "react";
import { Button, Box, Tabs, Tab } from "@mui/material";
import UserInfoModal from "./components/UserInfoModal";
import ShoppingCart from "./components/ShoppingCart";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, display: "flex", alignItems: "center", gap: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="User Profile" />
          <Tab label="Shopping Cart" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <Button variant="contained" size="large" onClick={() => setIsModalOpen(true)}>
            Complete Your Profile
          </Button>
          <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </Box>
      )}

      {tab === 1 && <ShoppingCart />}
    </Box>
  );
}

export default App;
