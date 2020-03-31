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
            <a
                style={{
                    display: "inline-flex"
                }}
                onClick={handleClickOpen('paper')}
                className="badge badge-light"
                target="_blank" rel="noopener noreferrer"
                href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/reference/reference.md"
            >
                <svg className="bi bi-question-circle" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                        clipRule="evenodd" />
                    <path
                        d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                </svg>
                <div className="dataSource">Acknowledgements</div>
            </a>
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