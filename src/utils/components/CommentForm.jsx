import React from 'react'
import { Box, TextField, Button } from '@mui/material'
import { Send } from '@mui/icons-material'

function CommentForm({ value, onChange, onSubmit }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        bgcolor: "#fafafa",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <TextField
        fullWidth
        placeholder="Write a comment..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline
        rows={2}
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            borderRadius: "6px",
            "& fieldset": { borderColor: "#e0e0e0" },
            "&.Mui-focused fieldset": {
              borderColor: "#2ED573",
              borderWidth: "2px",
            },
          },
        }}
      />
      <Button
        variant="contained"
        endIcon={<Send />}
        onClick={onSubmit}
        disabled={!value.trim()}
        sx={{
          backgroundColor: "#2ED573",
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "6px",
          "&:hover": { backgroundColor: "#26c061" },
          "&:disabled": { bgcolor: "#ddd", color: "#999" },
        }}
      >
        Post Comment
      </Button>
    </Box>
  )
}

export default CommentForm
