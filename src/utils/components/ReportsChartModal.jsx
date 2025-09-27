import { Modal, Box, Typography, Button } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import CloseIcon from "@mui/icons-material/Close";

function ReportsChartModal({ open, onClose, chartData }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          border: 0,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Reports Over Time
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={onClose}>
              <CloseIcon />
            </Button>
          </Box>
        </Box>

        <LineChart
          xAxis={[{ data: chartData.map((d) => d.month), scaleType: "band" }]}
          series={[
            { data: chartData.map((d) => d.responded), label: "Responded" },
            {
              data: chartData.map((d) => d.emergency),
              label: "Emergency",
              color: "#ff0000",
            },
          ]}
          width={700}
          height={400}
        />
      </Box>
    </Modal>
  );
}

export default ReportsChartModal;
