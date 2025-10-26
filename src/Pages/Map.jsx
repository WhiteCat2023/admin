import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Fade,
  TextField,
  InputAdornment,
  CardActionArea,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getAllReports } from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";
import { getTierColor } from "../utils/helpers";
import FilterListAltIcon from "@mui/icons-material/FilterListAlt";

const GOOGLE_MAPS_API_KEY = "AIzaSyBXEUzzVkNk1BpBESFqbftnG6Om66vNPY0";
const GOOGLE_MAPS_ID = "b183e79aec18c6128664e1b8";

function Map() {
  const [reports, setReports] = useState([]);
  const [showContent, setShowContent] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const mapRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setShowContent(false);
    try {
      const result = await getAllReports();
      if (result.status === HttpStatus.OK) {
        setReports(result.data);
        console.log(result.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setShowContent(true);
    }
  };

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleCardClick = (item) => {
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const renderListItem = (item) => {
    const formattedDate = item.timestamp?.toDate
      ? format(item.timestamp.toDate(), "MMM d | h:mma")
      : "";
    const isSelected = selectedItem && selectedItem.id === item.id;
    return (
      <Card
        key={item.id}
        sx={{
          mb: 1,
          borderRadius: 2,
          cursor: "pointer",
          border: isSelected ? "3px solid #34A853" : "1px solid #34A853",
          backgroundColor: isSelected ? "#e5fcebff" : "white",
        }}
        elevation={0}
        onClick={() => handleCardClick(item)}
      >
        <CardActionArea>
          <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <Divider
              orientation="vertical"
              sx={{
                height: 70, // Match the text height
                borderRightWidth: 3, // Thicker line
                borderColor: "#34A853", // Color
                borderRadius: 2,
                mr: 2, // More margin for better spacing
              }}
            />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={700}
                  fontSize={16}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontSize={12}
                >
                  {formattedDate}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontSize={12}
                >
                  Status: {item.status}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  fontSize={12}
                >
                  <Typography
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: getTierColor(item),
                      marginRight: 1,
                      verticalAlign: "middle",
                    }}
                  ></Typography>
                  {item.tier}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.title || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (report.description || "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      ),
    [reports, searchText]
  );

  function Direction({ selectedItem }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [routeIndex, setRouteIndex] = useState(0);

    const selectedRoute = routes[routeIndex];
    const leg = selectedRoute?.legs[0];

    // Initialize Directions Service and Renderer
    useEffect(() => {
      if (!routesLibrary || !map) return;

      const service = new routesLibrary.DirectionsService();
      const renderer = new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: false,
        preserveViewport: false,
      });

      setDirectionsService(service);
      setDirectionsRenderer(renderer);

      return () => {
        renderer.setMap(null); // Cleanup on unmount
      };
    }, [routesLibrary, map]);

    // Handle route rendering when user selects a new item
    useEffect(() => {
      if (!directionsService || !directionsRenderer) return;

      // If nothing selected, clear existing route
      if (
        !selectedItem ||
        !selectedItem.location ||
        selectedItem.location.length < 2
      ) {
        directionsRenderer.setDirections({ routes: [] });
        setRoutes([]);
        setRouteIndex(0);
        return;
      }

      // ✅ Clear any previous directions before new request
      directionsRenderer.setDirections({ routes: [] });

      const [lng, lat] = selectedItem.location.map(Number);
      if (isNaN(lat) || isNaN(lng)) return;

      const origin = { lat: 10.2943, lng: 123.8935 }; // Replace with your desired origin
      const destination = { lat, lng };

      directionsService
        .route({
          origin,
          destination,
          travelMode: routesLibrary.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        })
        .then((response) => {
          if (response?.routes?.length) {
            directionsRenderer.setDirections(response);
            setRoutes(response.routes);
            setRouteIndex(0);
          } else {
            directionsRenderer.setDirections({ routes: [] });
          }
        })
        .catch((err) => console.error("Error fetching directions:", err));
    }, [selectedItem, directionsService, directionsRenderer, routesLibrary]);

    // Update displayed route index dynamically
    useEffect(() => {
      if (directionsRenderer && routes.length > 0) {
        directionsRenderer.setRouteIndex(routeIndex);
      }
    }, [routeIndex, directionsRenderer, routes]);

    // 🧭 Optional info card
    if (!selectedItem || !leg) return null;
    return (
      <Box
        sx={{
          position: "absolute",
          top: 60,
          right: 10,
          background: "white",
          padding: 2.5,
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
          maxWidth: "300px",
        }}
      >
        <Typography variant="h6">{selectedRoute.summary}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {leg.start_address.split(",")[0]} → {leg.end_address.split(",")[0]}
        </Typography>
        <Typography variant="body2">Distance: {leg.distance?.text}</Typography>
        <Typography variant="body2">Duration: {leg.duration?.text}</Typography>

        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {routes.map((route, index) => (
            <li key={route.summary} style={{ margin: "5px 0" }}>
              <button
                onClick={() => setRouteIndex(index)}
                style={{
                  background: routeIndex === index ? "#2ED573" : "#f0f0f0",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {route.summary}
              </button>
            </li>
          ))}
        </ul>
      </Box>
    );
  }
  
  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", fontFamily: '"Poppins", sans-serif' }}
          >
            MAP
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ borderRadius: 4 }}>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: "15px",
                "&.Mui-focused fieldset": {
                  borderColor: "#084518",
                },
                "&:hover fieldset": {
                  borderColor: "#084518",
                },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            height: "81vh",
          }}
        >
          <Box sx={{
            backgroundColor: "#fff",
            flex: 1,
            display: "flex"
          }}>
            {/* Left side list */}
            <Box sx={{ width: "40%", p: 2, overflowY: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    OVERSEE
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    List of places needed action
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: 1,
                    }}
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  >
                    <FilterListAltIcon sx={{ color: "#084518" }} />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                      list: {
                        "aria-labelledby": "basic-button",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={handleClose}>All</MenuItem>
                    <MenuItem onClick={handleClose}>Responded</MenuItem>
                    <MenuItem onClick={handleClose}>Ignored</MenuItem>
                  </Menu>
                </Box>
              </Box>

              {filteredReports.length === 0 ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No reports available
                </Typography>
              ) : (
                filteredReports.map((item) => {
                  const formattedDate = item.timestamp?.toDate
                    ? format(item.timestamp.toDate(), "hh:mma - MMM d")
                    : "";

                  return renderListItem(item);
                })
              )}
            </Box>

            {/* Right side map */}
            <Box sx={{ flex: 1, position: "relative", padding: 2, }}>
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  defaultZoom={16}
                  defaultCenter={{ lat: 10.309, lng: 123.893 }}
                  options={{ gestureHandling: "greedy", mapId: GOOGLE_MAPS_ID }}
                  style={{ width: "100%", height: "100%", borderRadius: 2 }}
                  onLoad={onLoad}
                  fullscreenControl={true}

                >
                  {selectedItem
                    ? null
                    : reports.map((item) =>
                        item.location &&
                        item.location.length >= 2 &&
                        !isNaN(parseFloat(item.location[1])) &&
                        !isNaN(parseFloat(item.location[0])) ? (
                          <AdvancedMarker
                            key={item.id}
                            position={{
                              lat: parseFloat(item.location[1]),
                              lng: parseFloat(item.location[0]),
                            }}
                          />
                        ) : null
                      )}
                  <Direction selectedItem={selectedItem} />
                </GoogleMap>
              </APIProvider>
            </Box>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}

export default Map;
