import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { Context } from '../../Context/AuthContext';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function Avisos() {
    const { message, typeMessage, openMessage, handleClose, troca, setOpenMessage } = React.useContext(Context);

    React.useEffect(() => {
        async function again() {
            if (openMessage === true) {
                setOpenMessage(false)
                await sleep(100)
            }
            if (troca !== "")
                setOpenMessage(true)
        } again()
    }, [troca])

    return (
        <Snackbar open={openMessage} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={typeMessage}>
                {message}
            </Alert>
        </Snackbar>
    );
}
