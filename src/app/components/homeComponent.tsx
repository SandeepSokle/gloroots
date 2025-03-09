"use client";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import DataTable from "./table";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddForm from "./AddForm";

export default function HomeComponent() {
  // state for hold local search value
  const [localSearch, setLocalSearch] = useState("");
  //   state for hold search value to filter data
  const [search, setSearch] = useState("");
  //   loading state to show loading spinner
  const [loading, setLoading] = useState(false);

  // handle form update fields
  const [formUpdate, setFormUpdate] = useState<boolean>(false);

  // handle form type
  const [formType, setFormType] = useState<"add" | "edit" | "delete" | "view">(
    "add"
  );

  // handle form modal open close
  const [formModal, setFormModal] = useState(false);

  //handle selected row data
  const [selectedRow, setSelectedRow] = useState<string | null>("");
  // handle add data button click event to open add form modal

  const handleAddData = (formType: "add" | "edit" | "delete" | "view") => {
    // handle add data button click event to open add form modal
    setFormType(formType);
    setFormModal(true);
    setSelectedRow(null);
  };

  const handleSearch = (e: any) => {
    // handle local search value update on change in search event
    let value = e.target.value;
    if (value === "") {
      setSearch("");
    }
    setLocalSearch(e.target.value);
  };

  const handleSearchClick = () => {
    // handle search click event to update search value
    setSearch(localSearch);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4, backgroundColor: "#f5f5f5" }}>
      {/* Header Space this contain the search bar and add new button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1976d2",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Gloroots
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            label="Search"
            onChange={handleSearch}
            value={localSearch}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearchClick} edge="end">
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleAddData("add");
            }}
            disabled={loading}
          >
            Add New
          </Button>
        </Box>
      </Box>
      {/* Data table to preview all data in pagination format with functionality sorting filtering and searching */}
      <DataTable
        loading={loading}
        setLoading={setLoading}
        search={search}
        setFormModal={setFormModal}
        setFormType={setFormType}
        setSelectedRow={setSelectedRow}
        formUpdate={formUpdate}
        setFormUpdate={setFormUpdate}
      />
      {/* Add Edit Delete Preview Modal Here */}
      {formModal && (
        <AddForm
          formModal={formModal}
          setFormModal={setFormModal}
          formType={formType}
          selectedRow={selectedRow}
          setFormUpdate={setFormUpdate}
        />
      )}
    </Paper>
  );
}
