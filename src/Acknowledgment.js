import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const emails = ['username@gmail.com', 'user02@gmail.com'];
const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
});


export default function ScrollDialog() {
    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState('paper');

    const handleClickOpen = (scrollType) => () => {
        setOpen(true);
        setScroll(scrollType);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <div>
            <Button variant="text" size="small" style={{ padding: "0px", margin: "0px", fontSize: "60%", textTransform: "none" }} onClick={handleClickOpen('paper')}
            >
                Acknowledgements
                </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" style={{ marginRight: "0px", padding: "10px" }}>Data Acknowledgement</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                        style={{ color: "black", fontSize: "80%" }}
                    >
                        <p style={{ marginBottom: "1px" }}>The data on our site is publicly available and is obtained from a variety of official government sources. A full list of acknowledgements is found below. </p>
                        <List style={{ marginTop: "1px", padding: "0px" }}>
                            <ListItem>
                                <p>© State of New South Wales NSW Ministry of Health. For current information go to <a href="www.health.nsw.gov.au" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>www.health.nsw.gov.au.</a></p>
                            </ListItem>
                            <ListItem>
                                <p> © The State of Queensland (Queensland Health) at <a href="https://www.health.qld.gov.au/" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://www.health.qld.gov.au/.</a></p>
                            </ListItem>
                            <ListItem>
                                <p> The Government of South Australia, SA Health at <a href="https://www.sahealth.sa.gov.au" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://www.sahealth.sa.gov.au.</a></p>
                            </ListItem>
                            <ListItem>
                                <p>Australian Capital Territory Government, ACT Health at <a href="https://www.covid19.act.gov.au/home" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://www.covid19.act.gov.au/home.</a></p>
                            </ListItem>
                            <ListItem>
                                <p>Government of Tasmania. at <a href="https://www.tas.gov.au/." target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://www.tas.gov.au/</a></p>
                            </ListItem>
                            <ListItem>
                                <p> Victoria State Government, Department of Health and Human Services at <a href="https://www.dhhs.vic.gov.au/" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://www.dhhs.vic.gov.au/</a></p>
                            </ListItem>
                            <ListItem>
                                <p>Northern Territory Government, at <a href="https://nt.gov.au/" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://nt.gov.au/</a></p>
                            </ListItem>
                            <ListItem>
                                <p> Government of Western Australia, Department of Health at <a href="https://ww2.health.wa.gov.au/Home" target="_blank"
                                    rel="noopener noreferrer" style={{ color: "#5499C7" }}>https://ww2.health.wa.gov.au/Home</a></p>
                            </ListItem>
                        </List>
                        <p style={{ marginTop: "2px" }}>We are not affiliated to nor endorsed by these organisations in any way. We are a volunteer team and we use the data we collect strictly for non-commercial, educational,reporting and research purposes. Care is taken to ensure the data is accurate, and not reframed or misrepresented.</p>
                        <p>We strongly recommend that users of this website adhere to the advice and regulations provided by their respective local and federal governments and authorities.</p>
                        <p>If you have concerns, please contact us through our <a href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform" target="_blank"
                            rel="noopener noreferrer" style={{ color: "#5499C7" }}>feedback form.</a> </p>
                        <p>Covid-19-au, <br />
                            Stay calm, stay informed.</p>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}