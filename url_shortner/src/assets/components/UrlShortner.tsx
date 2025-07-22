// src/components/UrlShortner.tsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid } from '@mui/material';
import './UrlShortner.css';

interface UrlInput {
  originalUrl: string;
  validity: string;
  shortcode: string;
  shortUrl?: string;
}

const MAX_URLS = 5;

const UrlShortner: React.FC = () => {
  const [inputs, setInputs] = useState<UrlInput[]>([{ originalUrl: '', validity: '', shortcode: '' }]);

  const handleChange = (index: number, field: keyof UrlInput, value: string) => {
    const updated = [...inputs];
    updated[index][field] = value;
    setInputs(updated);
  };

  const handleAddField = () => {
    if (inputs.length < MAX_URLS) {
      setInputs([...inputs, { originalUrl: '', validity: '', shortcode: '' }]);
    }
  };

  const validateUrl = (url: string) =>
    /^https?:\/\/[^\s$.?#].[^\s]*$/.test(url);

  const handleSubmit = async () => {
    const updatedInputs = await Promise.all(
      inputs.map(async (input) => {
        if (!validateUrl(input.originalUrl)) {
          alert(`Invalid URL: ${input.originalUrl}`);
          return input;
        }

        const payload = {
          originalUrl: input.originalUrl,
          validity: input.validity ? parseInt(input.validity) : undefined,
          shortcode: input.shortcode || undefined,
        };

        try {
          const res = await fetch('http://localhost:8080/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            return { ...input, shortUrl: data.shortUrl };
          } else {
            alert(`Failed to shorten: ${input.originalUrl}`);
            return input;
          }
        } catch (error) {
          alert(`Error shortening URL: ${input.originalUrl}`);
          return input;
        }
      })
    );

    setInputs(updatedInputs);
  };

  return (
    <Box className="url-shortener-wrapper">
      <Typography variant="h4" className="title">URL Shortener</Typography>

      {inputs.map((input, index) => (
        <Grid container spacing={2} key={index} className="input-group">
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`Original URL ${index + 1}`}
              value={input.originalUrl}
              onChange={(e) => handleChange(index, 'originalUrl', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Validity (mins)"
              type="number"
              value={input.validity}
              onChange={(e) => handleChange(index, 'validity', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Preferred Shortcode"
              value={input.shortcode}
              onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
            />
          </Grid>
          {input.shortUrl && (
            <Grid item xs={12}>
              <Typography className="short-url">
                Short URL: <a href={input.shortUrl} target="_blank" rel="noopener noreferrer">{input.shortUrl}</a>
              </Typography>
            </Grid>
          )}
        </Grid>
      ))}

      {inputs.length < MAX_URLS && (
        <Button onClick={handleAddField} className="add-url-btn" variant="outlined">
          + Add URL
        </Button>
      )}

      <Button variant="contained" className="shorten-button" onClick={handleSubmit}>
        Shorten URLs
      </Button>
    </Box>
  );
};

export default UrlShortner;
