import { Modal, Box, Typography, TextField, Stack, Button } from "@mui/material";

function ForumModal({
  open,
  onClose,
  title,
  discussion,
  onTitleChange,
  onDescriptionChange,
  onSave,
  pillButtonFilled,
  pillButton,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          bgcolor: "background.paper",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          p: 4,
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {title}
        </Typography>

        <TextField
          fullWidth
          label="Title"
          value={discussion.title}
          onChange={(e) => onTitleChange(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "&.Mui-focused fieldset": {
                borderColor: "#34A853",
                borderWidth: "2px",
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={discussion.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "&.Mui-focused fieldset": {
                borderColor: "#2ED573",
                borderWidth: "2px",
              },
            },
          }}
        />

        <Stack direction="row" spacing={2}>
          <Button onClick={onSave} sx={pillButtonFilled}>
            {title.includes("Edit") ? "Update" : "Create"}
          </Button>
          <Button onClick={onClose} sx={pillButton}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

export default ForumModal;
