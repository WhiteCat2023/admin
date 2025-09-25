import {
  APIProvider,
  Map as GoogleMap,
  Marker,
} from "@vis.gl/react-google-maps";
import { Box, Typography, Card, CardContent, Divider, Skeleton, Fade } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState, useRef } from "react";
import { getAllReports } from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";

const GOOGLE_MAPS_API_KEY = "AIzaSyBXEUzzVkNk1BpBESFqbftnG6Om66vNPY0"; // replace with env variable

function Map() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
      setShowContent(true);
    }
  };

  const handleCardClick = (item) => {
    if (item.location && mapRef.current) {
      mapRef.current.panTo({ lat: item.location[1], lng: item.location[0] });
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

  const SkeletonLoader = () => (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
        MAP
      </Typography>

      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          height: "80vh",
        }}
      >
        <Box sx={{ width: "40%", p: 2, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            OVERSEE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            List of places needed action
          </Typography>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
        </Box>
      </Box>
    </Box>
  );

  const MapContent = () => (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
          MAP
        </Typography>

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

            {reports.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No reports available
              </Typography>
            ) : (
              reports.map((item) => {
                const formattedDate = item.timestamp?.toDate
                  ? format(item.timestamp.toDate(), "hh:mma - MMM d")
                  : "";

                return (
                  <Card
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    sx={{
                      mb: 1,
                      border: "1px solid #2ED573",
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    elevation={0}
                  >
                    <CardContent
                      sx={{ display: "flex", alignItems: "center", p: 2 }}
                    >
                      <Divider
                        orientation="vertical"
                        sx={{
                          height: 40,
                          borderRightWidth: 3,
                          borderColor: getTierColor(item),
                          borderRadius: 2,
                          mr: 2,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formattedDate}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>

          {/* Right side map */}
          <Box sx={{ flex: 1 }}>
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                defaultZoom={16}
                defaultCenter={{ lat: 10.309, lng: 123.893 }}
                options={{ gestureHandling: "greedy" }}
                style={{ width: "100%", height: "100%" }}
                onLoad={(map) => (mapRef.current = map)}
              >
                {reports.map((item) =>
                  item.location ? (
                    <Marker
                      key={item.id}
                      position={{
                        lat: item.location[1],
                        lng: item.location[0],
                      }}
                    />
                  ) : null
                )}
              </GoogleMap>
            </APIProvider>
          </Box>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <>
      {isLoading && <SkeletonLoader />}
      {!isLoading && <MapContent />}
    </>
  );
}

export default Map;
