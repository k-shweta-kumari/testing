import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectOption {
  label: string;
  value: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

const COUNTRY_OPTIONS: SelectOption[] = [
  { label: "United States", value: "us" },
  { label: "India", value: "in" },
  { label: "United Kingdom", value: "gb" },
  { label: "Canada", value: "ca" },
  { label: "Australia", value: "au" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Japan", value: "jp" },
];

const ROLE_OPTIONS: SelectOption[] = [
  { label: "Developer", value: "developer" },
  { label: "Designer", value: "designer" },
  { label: "Product Manager", value: "product_manager" },
  { label: "Data Scientist", value: "data_scientist" },
  { label: "DevOps Engineer", value: "devops_engineer" },
  { label: "QA Engineer", value: "qa_engineer" },
  { label: "Other", value: "other" },
];

const selectOptionSchema = Yup.object({
  label: Yup.string().required(),
  value: Yup.string().required(),
});

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "Must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: selectOptionSchema.nullable().required("Please select a role"),
  country: selectOptionSchema.nullable().required("Please select a country"),
  bio: Yup.string().max(300, "Bio must be 300 characters or less"),
});

async function saveUserProfile(data: Record<string, unknown>): Promise<void> {
  const response = await fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}

export default function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: null as SelectOption | null,
      country: null as SelectOption | null,
      bio: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitStatus("loading");
      setApiError(null);

      try {
        values.role = values.role?.value;
        await saveUserProfile(values);
        setSubmitStatus("success");
        setTimeout(() => {
          setSubmitStatus("idle");
          resetForm();
          onClose();
        }, 1500);
      } catch (err) {
        setApiError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
        setSubmitStatus("error");
      }
    },
  });

  const handleClose = () => {
    if (submitStatus === "loading") return;
    formik.resetForm();
    setSubmitStatus("idle");
    setApiError(null);
    onClose();
  };

  const isLoading = submitStatus === "loading";
  const isSuccess = submitStatus === "success";

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          User Profile
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isLoading}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid size={6}>
              <TextField
                fullWidth
                id="firstName"
                label="First Name"
                placeholder="Jane"
                {...formik.getFieldProps("firstName")}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>

            {/* Last Name */}
            <Grid size={6}>
              <TextField
                fullWidth
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                {...formik.getFieldProps("lastName")}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>

            {/* Email */}
            <Grid size={12}>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                type="email"
                placeholder="jane.doe@example.com"
                {...formik.getFieldProps("email")}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            {/* Role */}
            <Grid size={6}>
              <FormControl
                fullWidth
                error={formik.touched.role && Boolean(formik.errors.role)}
              >
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  label="Role"
                  value={formik.values.role?.value ?? ""}
                  onChange={(e) => {
                    const selected =
                      ROLE_OPTIONS.find((o) => o.value === e.target.value) ??
                      null;
                    formik.setFieldValue("role", selected);
                  }}
                  onBlur={() => formik.setFieldTouched("role", true)}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>
                    {formik.errors.role as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Country */}
            <Grid size={6}>
              <FormControl
                fullWidth
                error={formik.touched.country && Boolean(formik.errors.country)}
              >
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  label="Country"
                  value={formik.values.country?.value ?? ""}
                  onChange={(e) => {
                    const selected =
                      COUNTRY_OPTIONS.find((o) => o.value === e.target.value) ??
                      null;
                    formik.setFieldValue("country", selected);
                  }}
                  onBlur={() => formik.setFieldTouched("country", true)}
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.country && formik.errors.country && (
                  <FormHelperText>
                    {formik.errors.country as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Bio */}
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                id="bio"
                label="Bio"
                placeholder="Tell us a little about yourself…"
                {...formik.getFieldProps("bio")}
                error={formik.touched.bio && Boolean(formik.errors.bio)}
                helperText={
                  formik.touched.bio && formik.errors.bio
                    ? formik.errors.bio
                    : `${formik.values.bio.length}/300`
                }
                slotProps={{ htmlInput: { maxLength: 300 } }}
              />
            </Grid>

            {/* API error */}
            {apiError && (
              <Grid size={12}>
                <Alert severity="error" onClose={() => setApiError(null)}>
                  {apiError}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isSuccess}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : isSuccess ? (
                <CheckCircleIcon fontSize="small" />
              ) : null
            }
            color={isSuccess ? "success" : "primary"}
          >
            {isSuccess ? "Saved!" : "Save Profile"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
