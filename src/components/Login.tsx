// src/components/Login.tsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Alert,
  Container 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginProps {
  onLogin: (password: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    // Small delay to prevent brute force attempts
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use the login function from useAuth hook
    const success = onLogin(password);
    
    if (!success) {
      setError('Invalid password. Please try again.');
      setPassword(''); // Clear password field on error
    }
    
    setLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && password && !loading) {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Paper 
          elevation={6}
          sx={{ 
            p: 4, 
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <LockOutlinedIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2 
              }} 
            />
            <Typography variant="h4" gutterBottom>
              BigQuery Admin
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter password to access the dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            type="password"
            label="Access Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mb: 3 }}
            autoFocus
          />

          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={handleLogin}
            disabled={!password || loading}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </Button>
        </Paper>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          BigQuery Data Management Interface
        </Typography>
      </Box>
    </Container>
  );
};