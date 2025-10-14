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
  const [selectedItem, setSelectedItem] = useState(null);
  const mapRef = useRef(null);

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
            .includes(searchText.toLowerCase()) ||
          (report.description || "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      ),
    [reports, searchText]
  );
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
      </Fade>
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

    // function Direction({ selectedItem }) {
    //   const map = useMap();
    //   const routesLibrary = useMapsLibrary("routes");
    //   const [directionService, setDirectionService] = useState();
    //   const [directionRenderer, setDirectionRenderer] = useState();
    //   const [routes, setRoutes] = useState([]);
    //   const [routeIndex, setRouteIndex] = useState();
    //   const selected = routes[routeIndex];
    //   const leg = selected?.legs[0];

    //   useEffect(() => {
    //     console.log("Routes: ", routes);
    //   }, [routes]);

    //   useEffect(() => {
    //     if (!routesLibrary || !map) return;
    //     setDirectionService(new routesLibrary.DirectionsService());
    //     setDirectionRenderer(new routesLibrary.DirectionsRenderer({ map }));
    //   }, [routesLibrary, map]);

    //   useEffect(() => {

    //     if (
    //       !directionService ||
    //       !directionRenderer ||
    //       !selectedItem ||
    //       !selectedItem.location ||
    //       selectedItem.location.length < 2 ||
    //       isNaN(parseFloat(selectedItem.location[1])) ||
    //       isNaN(parseFloat(selectedItem.location[0]))
    //     ) {
    //       if (directionRenderer) {
    //         directionRenderer.setDirections(null);
    //       }
    //       setRoutes([]);
    //       setRouteIndex(undefined);
    //       return;
    //     }


    //     const origin = { lat: 10.2943, lng: 123.8935 };
    //     const destination = {
    //       lat: parseFloat(selectedItem.location[1]),
    //       lng: parseFloat(selectedItem.location[0]),
    //     };

    //     directionService
    //       .route({
    //         origin,
    //         destination,
    //         travelMode: routesLibrary.TravelMode.DRIVING,
    //         provideRouteAlternatives: true,
    //       })
    //       .then((response) => {
    //         directionRenderer.setDirections(response);
    //         setRoutes(response.routes);
    //         setRouteIndex(0);
    //       });
    //   }, [directionService, directionRenderer, selectedItem, map, routesLibrary]);

    //   useEffect(() => {
    //     if (
    //       directionRenderer &&
    //       routes.length > 0 &&
    //       routeIndex !== undefined
    //     ) {
    //       directionRenderer.setRouteIndex(routeIndex);
    //     }
    //   }, [routeIndex, directionRenderer, routes]);

    //   if (!selectedItem) {
    //     // Show markers only if no route selected
    //     return null;
    //   }

    //   if (!leg) return null;

    //   return (
    //     <Box
    //       sx={{
    //         position: "absolute",
    //         top: 60,
    //         right: 10,
    //         background: "white",
    //         padding: 2.5,
    //         borderRadius: "8px",
    //         boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    //         zIndex: 1000,
    //         maxWidth: "300px",
    //       }}
    //     >
    //       <h2 style={{ margin: 0, fontSize: "16px" }}>{selected.summary}</h2>
    //       <p style={{ margin: "5px 0", fontSize: "14px" }}>
    //         {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
    //       </p>
    //       <p style={{ margin: "5px 0", fontSize: "14px" }}>
    //         Distance: {leg.distance?.text}
    //       </p>
    //       <p style={{ margin: "5px 0", fontSize: "14px" }}>
    //         Duration: {leg.duration?.text}
    //       </p>

    //       <ul style={{ listStyle: "none", padding: 0 }}>
    //         {routes.map((route, index) => (
    //           <li key={route.summary} style={{ margin: "5px 0" }}>
    //             <button
    //               onClick={() => setRouteIndex(index)}
    //               style={{
    //                 background: routeIndex === index ? "#2ED573" : "#f0f0f0",
    //                 border: "none",
    //                 padding: "5px 10px",
    //                 borderRadius: "4px",
    //                 cursor: "pointer",
    //               }}
    //             >
    //               {route.summary}
    //             </button>
    //           </li>
    //         ))}
    //       </ul>
    //     </Box>
    //   );
    // }
  };



export default Map;
