import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  TextField,
  Chip,
  Paper,
  Grid,
  Badge,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Wireless Headphones", price: 79.99, emoji: "🎧", category: "Audio" },
  { id: 2, name: "Mechanical Keyboard", price: 129.99, emoji: "⌨️", category: "Peripherals" },
  { id: 3, name: "USB-C Hub", price: 49.99, emoji: "🔌", category: "Accessories" },
  { id: 4, name: "Webcam HD", price: 89.99, emoji: "📷", category: "Video" },
  { id: 5, name: "Desk Lamp", price: 39.99, emoji: "💡", category: "Lighting" },
  { id: 6, name: "Mouse Pad XL", price: 24.99, emoji: "🖱️", category: "Accessories" },
];

const VALID_COUPONS: Record<string, number> = {
  SAVE10: 10,
  SAVE20: 20,
  HALFOFF: 50,
};

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const discountAmount = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discountAmount;

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // BUG 2: +0 instead of +1 — adding the same item never increases quantity
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 0 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    // BUG 3: === instead of !== — keeps only the deleted item, removes everything else
    setCartItems((prev) => prev.filter((item) => item.id === id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            // BUG 4: direct mutation — React sees same reference, skips re-render
            item.quantity += delta;
            return item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const applyCoupon = () => {
    const discount = VALID_COUPONS[couponInput.trim().toUpperCase()];
    // BUG 5: if/else branches swapped — valid codes show error, invalid codes succeed
    if (discount) {
      setCouponError("Invalid coupon code");
      setAppliedDiscount(0);
      setAppliedCoupon("");
    } else {
      setCouponError("");
      setAppliedDiscount(discount || 0);
      setAppliedCoupon(couponInput.trim().toUpperCase());
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Tech Store
      </Typography>

      <Grid container spacing={3}>
        {/* Product Grid */}
        <Grid size={7}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Products
          </Typography>
          <Grid container spacing={2}>
            {PRODUCTS.map((product) => {
              const inCart = cartItems.find((i) => i.id === product.id);
              return (
                <Grid size={6} key={product.id}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 28 }}>{product.emoji}</Typography>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{product.name}</Typography>
                        <Chip label={product.category} size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                      <Typography sx={{ fontWeight: 700 }} color="primary">
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Button
                        size="small"
                        variant={inCart ? "outlined" : "contained"}
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => addToCart(product)}
                      >
                        {inCart ? `In cart (${inCart.quantity})` : "Add"}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Cart Panel */}
        <Grid size={5}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", position: "sticky", top: 24 }}>
            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCartIcon />
              </Badge>
              <Typography sx={{ fontWeight: 600 }}>Your Cart</Typography>
            </Box>

            {cartItems.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                <ShoppingCartIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography>Your cart is empty</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ px: 2, py: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: 20 }}>{item.emoji}</Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{item.name}</Typography>
                          <Typography sx={{ fontSize: 12 }} color="text.secondary">
                            ${item.price.toFixed(2)} each
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography sx={{ minWidth: 20, textAlign: "center", fontSize: 14 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                            <AddIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 52, textAlign: "right" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                      <Divider sx={{ mt: 1.5 }} />
                    </Box>
                  ))}
                </Box>

                {/* Coupon */}
                <Box sx={{ px: 2, pb: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      error={Boolean(couponError)}
                      helperText={couponError || (appliedCoupon ? `"${appliedCoupon}" applied!` : " ")}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" size="small" onClick={applyCoupon} sx={{ alignSelf: "flex-start", mt: "1px" }}>
                      Apply
                    </Button>
                  </Box>
                </Box>

                <Divider />

                {/* Totals */}
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography color="text.secondary" sx={{ fontSize: 14 }}>Subtotal</Typography>
                    <Typography sx={{ fontSize: 14 }}>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  {appliedDiscount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="success.main" sx={{ fontSize: 14 }}>
                        Discount ({appliedDiscount}%)
                      </Typography>
                      <Typography color="success.main" sx={{ fontSize: 14 }}>
                        −${discountAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                    <Typography color="primary" sx={{ fontWeight: 700, fontSize: 18 }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button variant="contained" fullWidth size="large" sx={{ mt: 1 }}>
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
