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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getAllReports } from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";

const GOOGLE_MAPS_API_KEY = "AIzaSyBXEUzzVkNk1BpBESFqbftnG6Om66vNPY0";
const GOOGLE_MAPS_ID = "b183e79aec18c6128664e1b8";

function Map() {
  const [reports, setReports] = useState([]);
  const [showContent, setShowContent] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

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

  const getTierColor = (item) => {
    const tier = item.tier?.toLowerCase();
    if (tier === "emergency") return "#ff0000";
    if (tier === "high") return "#ffbb00";
    if (tier === "medium") return "#fffb00";
    if (tier === "low") return "#00ff22";
    return "#2ED573";
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
          border: isSelected ? "3px solid #2ED573" : "1px solid #2ED573",
          backgroundColor: isSelected ? "inherit" : "white",
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
                borderColor: "#2ED573", // Color
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
              <Typography
                variant="body1"
                color={getTierColor(item)}
                sx={{
                  textShadow: "1px 1px 1px rgb(0, 0, 0)",
                }}
                fontSize={12}
              >
                {item.tier}
              </Typography>
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
            .includes(debouncedSearchText.toLowerCase()) ||
          (report.description || "")
            .toLowerCase()
            .includes(debouncedSearchText.toLowerCase())
      ),
    [reports, debouncedSearchText]
  );

  const MapContent = () => {
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
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
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
                  borderRadius: "15px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#2ED573",
                  },
                  "&:hover fieldset": {
                    borderColor: "#2ED573",
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
              height: "80vh",
            }}
          >
            {/* Left side list */}
            <Box sx={{ width: "40%", p: 2, overflowY: "auto" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                OVERSEE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                List of places needed action
              </Typography>

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
            <Box sx={{ flex: 1, position: "relative" }}>
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  defaultZoom={16}
                  defaultCenter={{ lat: 10.309, lng: 123.893 }}
                  options={{ gestureHandling: "greedy", mapId: GOOGLE_MAPS_ID }}
                  style={{ width: "100%", height: "100%" }}
                  onLoad={onLoad}
                  fullscreenControl={selectedItem}
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
      </Fade>
    );
  };

  return <MapContent />;
}

function Direction({ selectedItem }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionService, setDirectionService] = useState();
  const [directionRenderer, setDirectionRenderer] = useState();
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState();
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionService(new routesLibrary.DirectionsService());
    setDirectionRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (
      !directionService ||
      !directionRenderer ||
      !selectedItem ||
      !selectedItem.location ||
      selectedItem.location.length < 2 ||
      isNaN(parseFloat(selectedItem.location[1])) ||
      isNaN(parseFloat(selectedItem.location[0]))
    ) {
      if (directionRenderer) {
        directionRenderer.setMap(null);
      }
      setRoutes([]);
      setRouteIndex(undefined);
      return;
    }

    const origin = map.getCenter().toJSON();
    const destination = {
      lat: parseFloat(selectedItem.location[1]),
      lng: parseFloat(selectedItem.location[0]),
    };

    directionService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionRenderer.setDirections(response);
        setRoutes(response.routes);
        setRouteIndex(0);
      });
  }, [directionService, directionRenderer, selectedItem, map]);

  if (!selectedItem) {
    // Show markers only if no route selected
    return null;
  }

  if (!leg) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "16px" }}>{selected.summary}</h2>
      <p style={{ margin: "5px 0", fontSize: "14px" }}>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p style={{ margin: "5px 0", fontSize: "14px" }}>
        Distance: {leg.distance?.text}
      </p>
      <p style={{ margin: "5px 0", fontSize: "14px" }}>
        Duration: {leg.duration?.text}
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
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
    </div>
  );
}

export default Map;
