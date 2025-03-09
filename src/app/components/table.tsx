"use client";

import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridFilterModel,
} from "@mui/x-data-grid";
import { Button, IconButton, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Preview";

interface Row {
  id: string;
  name: string | null;
  city: string;
  country: string | null;
  alias: [string];
  regions: [string];
  coordinates: [number];
  province: string;
  timezone: string;
  unlocs: [string];
  code: number;
}

const operators = [
  "equals",
  "contains",
  "startsWith",
  "endsWith",
  "isEmpty",
  "isNotEmpty",
  "doesNotEqual",
];

export default function DataTable(props: {
  loading: boolean;
  setLoading: Function;
  search: string;
  setFormType: Function;
  setFormModal: Function;
  setSelectedRow: Function;
  formUpdate: boolean;
  setFormUpdate: Function;
}) {
  const {
    loading,
    setLoading,
    search,
    setFormType,
    setFormModal,
    setSelectedRow,
    formUpdate,
    setFormUpdate,
  } = props;
  const [rows, setRows] = React.useState<Row[]>([]);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = React.useState(0);
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });

  const handleOpenModal = (
    formType: "add" | "edit" | "delete" | "view",
    selectRow: string
  ) => {
    // handle add data button click event to open add form modal
    setFormType(formType);
    setFormModal(true);
    setSelectedRow(selectRow);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70, sortable: true },
    { field: "name", headerName: "Name", width: 160 },
    { field: "city", headerName: "City", width: 160 },
    {
      field: "country",
      headerName: "Country",
      width: 160,
    },
    {
      field: "coordinates",
      headerName: "Coordinates",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (params: any) => {
        return `${params?.join(", ") || "---"}`;
      },
    },
    {
      field: "province",
      headerName: "Province",
      description: "This column has a value getter and is not sortable.",
      width: 160,
    },
    {
      field: "timezone",
      headerName: "Timezone",
      description: "This column has a value getter and is not sortable.",
      sortable: true,
      width: 160,
    },
    {
      field: "unlocs",
      headerName: "Unlocs",
      description: "This column has a value getter and is not sortable.",
      sortable: true,
      width: 160,
      valueGetter: (params: any) => `${params?.join(", ") || "---"}`,
    },
    {
      field: "code",
      headerName: "Code",
      description: "This column has a value getter and is not sortable.",
      sortable: true,
      width: 160,
    },
    {
      field: "alias",
      headerName: "Alias",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (params: any) => `${params?.join(", ") || "---"}`,
    },
    {
      field: "regions",
      headerName: "Regions",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (params: any) => `${params?.join(", ") || "---"}`,
    },
    {
      field: "action",
      headerName: "Action",
      width: 160,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              handleOpenModal("view", params.row.id);
            }}
          >
            <PreviewIcon color="primary" />
          </IconButton>
          <IconButton
            onClick={() => {
              handleOpenModal("edit", params.row.id);
            }}
          >
            <EditIcon color="primary" />
          </IconButton>
          <IconButton
            onClick={() => {
              handleOpenModal("delete", params.row.id);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log("fetching data...", {
        filterModel,
      });

      // Build query params for API request
      const params = new URLSearchParams();

      // Pagination params
      params.append("_page", (paginationModel?.page + 1)?.toString() || "1");
      params.append("_limit", paginationModel?.pageSize?.toString() || "10");

      // Sorting params
      if (sortModel.length > 0) {
        params.append("_sort", sortModel[0]?.field);
        params.append("_order", sortModel[0]?.sort || "asc");
      }else{
        params.append("_sort", "time");
        params.append("_order", "desc");
      }

      if (search && search.length > 0) {
        params.append("q", search);
      }

      // Filter params
      if (filterModel && filterModel.items && filterModel.items.length > 0) {
        filterModel.items.forEach((filter, index) => {
          // Handle different operators for json-server
          let jsonServerOperator;
          let filterValue = filter.value ? filter.value.toString() : "";

          switch (filter.operator) {
            case "equals":
              // For equals, json-server uses exact match
              params.append(filter.field, filterValue);
              break;
            case "contains":
              // For contains, json-server uses _like
              params.append(`${filter.field}_like`, filterValue);
              break;
            case "startsWith":
              // For startsWith, add a caret at the beginning
              params.append(`${filter.field}_like`, `^${filterValue}`);
              break;
            case "endsWith":
              // For endsWith, add a dollar sign at the end
              params.append(`${filter.field}_like`, `${filterValue}$`);
              break;
            case "isEmpty":
              // For isEmpty, we need to check if the field exists but is empty
              params.append(`${filter.field}`, "");
              break;
            case "isNotEmpty":
              // For isNotEmpty, we need to use _ne
              params.append(`${filter.field}_ne`, "");
              break;
            case "doesNotContain":
              // json-server doesn't directly support 'doesNotContain',
              // you might need to handle this on the client side or customize your server
              console.warn(
                "doesNotContain operator not directly supported by json-server"
              );
              break;
            case "doesNotEqual":
              // For doesNotEqual, use _ne
              params.append(`${filter.field}_ne`, filterValue);
              break;
            case "isAnyOf":
              // For isAnyOf, you might need to make multiple requests or customize your server
              console.warn(
                "isAnyOf operator not directly supported by json-server"
              );
              break;
            default:
              // Default case, just use the value directly
              params.append(filter.field, filterValue);
          }
        });
      }

      const response = await fetch(
        `http://localhost:5000/ports?${params.toString()}`
      );

      // Extract Link header
      const linkHeader = response.headers.get("x-total-count");
      if (linkHeader) {
        setRowCount(parseInt(linkHeader));
      }
      let data = await response.json();

      if (filterModel && filterModel.items && filterModel.items.length > 0) {
        filterModel.items.forEach((filter, index) => {
          // Handle different operators for json-server
          let filterValue = filter.value ? filter.value.toString() : "";

          switch (filter.operator) {
            case "doesNotContain":
            case "isAnyOf":
              data = applyAdvancedFilters(data, filterModel);
              break;
            default:
              // Default case, just use the value directly
              data = data;
          }
        });
      }

      setRows(data);
      // Update state with fetched data
      // setRows(data.rows);
      // setRowCount(data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setFormUpdate(false);
    }
  }, [paginationModel, sortModel, filterModel, search, formUpdate]);

  // Fetch data when component mounts or dependencies change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Paper sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        sortingMode="server"
        onSortModelChange={setSortModel}
        filterMode="server"
        onFilterModelChange={setFilterModel}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}

const applyAdvancedFilters = (data: any, filterModel: any) => {
  if (!filterModel?.items?.length) return data;

  return data.filter((row: any) => {
    return filterModel.items.every((filter: any) => {
      const rowValue = row[filter.field]?.toString()?.toLowerCase() || "";
      const filterValue = filter.value?.toString()?.toLowerCase() || "";

      switch (filter.operator) {
        case "doesNotContain":
          return !rowValue.includes(filterValue);

        case "isAnyOf":
          const valuesArray = filter.value.map((v: any) => v.toLowerCase()); // assuming it's an array
          return valuesArray.includes(rowValue);

        default:
          return true; // let the server handle the rest
      }
    });
  });
};
