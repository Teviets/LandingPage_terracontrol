import React, { useState } from 'react';
import './DeleteAccount.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import logo from '../../assets/Images/logo_ico_green1.webp'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CardLogin() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
  };

  const borrarCuenta = async () => {
    try {
      const data = { usuario, contrasena };
      console.log(data);
      const response = await fetch('http://localhost:3000/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log(responseData);
      handleCloseConfirmDialog(); // Cierra el diálogo de confirmación
      setOpenSuccessDialog(true); // Abre el diálogo de éxito
    } catch (error) {
      console.error('Error al borrar la cuenta', error);
    }
  };

  return (
    <Card>
      <CardContent className="cardContentMUI">
        <img src={logo} className="logoico" alt="Logo" />
        <Typography variant="h4" component="div">
          Borra tu cuenta
        </Typography>

        <div className="cardContentMUIInstruccions">
          Para poder borrar tu cuenta, inicia sesión y tu cuenta se borrará automáticamente
        </div>

        <TextField
          id="usuario"
          label="Usuario"
          variant="outlined"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          id="contrasena"
          label="Contraseña"
          variant="outlined"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          fullWidth
          margin="normal"
        />

        <CardActions>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenConfirmDialog}>
            Borrar cuenta
          </Button>
        </CardActions>
      </CardContent>

      {/* Diálogo de confirmación de borrado */}
      <Dialog
        open={openConfirmDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseConfirmDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"¿Estás seguro de que deseas borrar tu cuenta?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Esta acción eliminará permanentemente tu cuenta y eliminara todos tus datos personales. ¿Estás seguro de que deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cerrar
          </Button>
          <Button onClick={borrarCuenta} color="secondary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de éxito */}
      <Dialog
        open={openSuccessDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseSuccessDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Cuenta borrada exitosamente"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Tu cuenta ha sido borrada de manera exitosa. Si tienes algún problema, contacta al soporte.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}