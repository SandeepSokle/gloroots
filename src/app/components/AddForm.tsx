import * as React from "react";
import {
  TextField,
  Button,
  Box,
  Stack,
  Modal,
  Typography,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};

interface UserInfo {
  name: string;
  city: string;
  country: string;
  province: string;
  timezone: string;
  coordinates: string; // Stored as a string for input field
  code: string;
  alias: string;
  regions: string;
}

export default function AddForm(props: any) {
  const { formModal, setFormModal, formType, selectedRow, setFormUpdate } =
    props;
  const handleClose = () => setFormModal(false);

  const [formData, setFormData] = React.useState<UserInfo>({
    name: "",
    city: "",
    country: "",
    province: "",
    timezone: "",
    coordinates: "", // Example: "55.5136433,25.4052165"
    code: "",
    alias: "",
    regions: "",
  });
  const [loading, setLoading] = React.useState<boolean>(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log("selectedRow:", selectedRow);
      const response = await fetch(
        `http://localhost:5000/ports/${selectedRow}`
      );
      console.log("response:", response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setFormData({
        ...data,
        alias: data.alias.join(", "),
        coordinates: data.coordinates.join(", "),
        regions: data.regions.join(", "),
      });
      // Update state with fetched data
      // setRows(data.rows);
      // setRowCount(data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRow]);

  React.useEffect(() => {
    if (selectedRow) {
      fetchData();
    }
    return () => {
      setFormData({
        name: "",
        city: "",
        country: "",
        province: "",
        timezone: "",
        coordinates: "", // Example: "55.5136433,25.4052165"
        code: "",
        alias: "",
        regions: "",
      });
    };
  }, [selectedRow]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form Data Submitted:", formData);

    if (formType === "view") {
      handleClose();
      return;
    }
    if (formType === "delete") {
      // Delete the record
      console.log("Deleting record with id:", selectedRow);
      const handleDelete = await handleDeleteRecored(selectedRow, setLoading);
      if (handleDelete) {
        setFormUpdate(true);
        handleClose();
      } else {
        console.error("Error deleting record:", selectedRow);
      }
      return;
    }

    // generate a unique id for the new record with 8 characters taken from A-Z
    const id = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Convert coordinates to an array of numbers
    const formattedData = {
      ...formData,
      coordinates: formData.coordinates.split(","), // Convert "55.51,25.40" -> [55.51, 25.40]
      alias: formData.alias.split(","), // Convert "alias1, alias2" -> ["alias1", "alias2"]
      regions: formData.regions.split(","), // Convert "region1, region2" -> ["region1", "region2"]
      id,
      unlocs: [id],
      time: new Date().toISOString(),
    };
    console.log("Formatted Data:", formattedData);

    if (formType === "edit") {
      // Update the record
      console.log("Updating record with id:", selectedRow);
      const handleEdit = await handleEditRecord(
        selectedRow,
        setLoading,
        formattedData
      );
      if (handleEdit) {
        setFormUpdate(true);
        handleClose();
      } else {
        console.error("Error updating record:", selectedRow);
      }
    } else {
      // Add the record
      console.log("Adding new record with id:", id);
      const handleAdd = await handleAddRecord(setLoading, formattedData);
      if (handleAdd) {
        setFormUpdate(true);
        handleClose();
      } else {
        console.error("Error adding record:", id);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Modal
        open={formModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          overflow: "auto",
        }}
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h5"
            // color={formType === "delete" ? "error" : "primary"}
            sx={{
              color: formType === "delete" ? "#d32f2f" : "#004d40",
              fontWeight: "bold",
            }}
          >
            {getFormHeader(formType)}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, overflow: "auto", padding: "20px" }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Coordinates (lat, lng)"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Alias (comma separated)"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Regions (comma separated)"
                name="regions"
                value={formData.regions}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <TextField
                fullWidth
                label="Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                disabled={isDisable(formType)}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                color={formType == "delete" ? "error" : "primary"}
                onClick={handleSubmit}
              >
                {getButtonName(formType)}
              </Button>
            </Stack>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

const getFormHeader = (formType: "add" | "edit" | "delete" | "view") => {
  switch (formType) {
    case "add":
      return "Add New Record – Enter details to create a new entry.";
    case "edit":
      return "Edit Record – Update information as needed.";
    case "delete":
      return "Delete Record – This action is irreversible.";
    case "view":
      return "View Record – Review the details.";
    default:
      return "Form – Manage Records";
  }
};

const isDisable = (formType: "add" | "edit" | "delete" | "view") => {
  switch (formType) {
    case "add":
    case "edit":
      return false;
    case "delete":
    case "view":
      return true;
    default:
      return false;
  }
};

const handleDeleteRecored = async (id: string, setLoading: Function) => {
  console.log("Deleting record with id:", id);
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:5000/ports/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Error deleting record:", error);
    return false;
  } finally {
    setLoading(false);
  }
};

const handleEditRecord = async (
  id: string,
  setLoading: Function,
  formattedData: any
) => {
  console.log("Editing record with id:", id);
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:5000/ports/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return true;
  } catch (error) {
    console.error("Error updating record:", error);
    return false;
  } finally {
    setLoading(false);
  }
};

const handleAddRecord = async (setLoading: Function, formattedData: any) => {
  console.log("Adding new record with id:", formattedData.id);
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:5000/ports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return true;
  } catch (error) {
    console.error("Error adding record:", error);
    return false;
  } finally {
    setLoading(false);
  }
};

const getButtonName = (formType: "add" | "edit" | "delete" | "view") => {
  switch (formType) {
    case "add":
      return "Add New Record";
    case "edit":
      return "Update Record";
    case "delete":
      return "Delete Record";
    case "view":
      return "Close";
    default:
      return "Submit";
  }
};
