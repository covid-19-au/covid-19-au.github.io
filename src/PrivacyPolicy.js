import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import PolicyIcon from "@material-ui/icons/Policy";

export default function PrivacyPolicy() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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
    <a>
      <Button
        variant="outlined"
        startIcon={<PolicyIcon />}
        onClick={handleClickOpen}
        style={{
          margin: "2px",
          backgroundColor: "white",
          variant: "outlined",
          textTransform: "none",
        }}
      >
        Privacy
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={"paper"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle
          id="scroll-dialog-title"
          style={{ marginRight: "0px", padding: "10px" }}
        >
          PRIVACY NOTICE
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
            style={{ color: "black", fontSize: "80%" }}
          >
            <DialogContentText>Last updated August 10, 2020</DialogContentText>
            <DialogContentText>
              Thank you for using COVID-19-AU.com. We are committed to
              protecting your personal information and your right to privacy.
              COVID-19-AU.com is bound by the Privacy Act 1988 (Cth), which sets
              out a number of principles concerning the privacy of individuals.
              <br />
              When you visit our website covid-19-au.com, we appreciate that you
              are trusting us with your personal information. We take your
              privacy very seriously. In this privacy notice, we seek to explain
              to you in the clearest way possible what information we collect,
              how we use it and what rights you have in relation to it. If there
              are any terms in this privacy notice that you do not agree with,
              please discontinue use of our Services immediately.
              <br />
              This privacy notice applies to all information we obtained from
              you through our website. Please read this privacy notice carefully
              as it will help you understand what we do with the information
              that we collect.
              <br />
            </DialogContentText>
            <DialogContentText>
              1. WHAT INFORMATION DO WE COLLECT?
              <br />
              We automatically collect certain information when you visit, use
              or navigate the Website. This information does not reveal your
              specific identity (like your name or contact information) but may
              include device and usage information, such as your IP address,
              browser and device characteristics, operating system, language
              preferences, referring URLs, device name, country, location,
              information about who and when you use our Website and other
              technical information. This information is primarily needed to
              maintain the operation of our Website, and for our internal
              analytics and reporting purposes.
              <br />
              Like many businesses, we also collect information through cookies
              and similar technologies.The information we collect includes:
              <br />
              Log and Usage Data. Log and usage data is service-related,
              diagnostic usage and performance information our servers
              automatically collect when you access or use our Website and which
              we record in log files. Depending on how you interact with us,
              this log data may include your IP address, device information,
              browser type and settings and information about your activity in
              the Website (such as the date/time stamps associated with your
              usage, pages and files viewed, searches and other actions you take
              such as which features you use), device event information (such as
              system activity, error reports and hardware settings).
              <br />
              Device Data. We collect device data such as information about your
              computer, phone, tablet or other device you use to access the
              Website. Depending on the device used, this device data may
              include information such as your IP address (or proxy server),
              location, browser type, hardware model, operating system
              information.
              <br />
              Location Data. We collect information data such as information
              about your device's location, which can be either precise or
              imprecise. How much information we collect depends on the type of
              settings of the device you use to access the Website. For example,
              we may use GPS and other technologies to collect geolocation data
              that tells us your current location (based on your IP address).
              You can opt out of allowing us to collect this information either
              by refusing access to the information or by disabling your
              Locations settings on your device. Note however, if you choose to
              opt out, you may not be able to use certain aspects of the
              Services.
              <br />
            </DialogContentText>
            <DialogContentText>
              2. HOW DO WE USE YOUR INFORMATION?
              <br />
              We may use your information for data analysis, identifying usage
              trends, determining the effectiveness of our promotional campaigns
              and to evaluate and improve our Website and your experience. We
              use and store this information in aggregated and anonymized form
              so that it is not associated with individual end users and does
              not include personal information. We will not use identifiable
              personal information.
            </DialogContentText>
            <DialogContentText>
              3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?
              <br />
              We may occasionally use services from third parties (e.g. Google
              Analytics) to process your information. Those parties will be
              permitted to obtain only the anonymised information.
              COVID-19-AU.com takes reasonable steps to ensure that these
              parties are bound by confidentiality and privacy obligations in
              relation to the protection of your personal information.
            </DialogContentText>
            <DialogContentText>
              4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
              <br />
              We may use cookies and similar tracking technologies (like web
              beacons and pixels) to access or store information.
            </DialogContentText>
            <DialogContentText>
              5. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?
              <br />
              Our servers are located in Australia. If you are accessing our
              Website from outside, please be aware that your information may be
              transferred to, stored, and processed by us in our facilities and
              by those third parties with whom we may share your personal
              information (see "WILL YOUR INFORMATION BE SHARED WITH ANYONE?"
              above), in and other countries.
              <br />
              If you are a resident in the European Economic Area, then these
              countries may not necessarily have data protection laws or other
              similar laws as comprehensive as those in your country. We will
              however take all necessary measures to protect your personal
              information in accordance with this privacy notice and applicable
              law.
            </DialogContentText>
            <DialogContentText>
              6. HOW LONG DO WE KEEP YOUR INFORMATION? <br />
              We will only keep your personal information for as long as it is
              necessary for the purposes set out in this privacy notice, unless
              a longer retention period is required or permitted by law (such as
              tax, accounting or other legal requirements). No purpose in this
              notice will require us keeping your personal information for
              longer than 1 year.
              <br />
              When we have no ongoing legitimate business need to process your
              personal information, we will either delete or anonymize such
              information, or, if this is not possible (for example, because
              your personal information has been stored in backup archives),
              then we will securely store your personal information and isolate
              it from any further processing until deletion is possible.
            </DialogContentText>
            <DialogContentText>
              7. HOW DO WE KEEP YOUR INFORMATION SAFE?
              <br />
              We have implemented appropriate technical and organizational
              security measures designed to protect the security of any personal
              information we process. However, despite our safeguards and
              efforts to secure your information, no electronic transmission
              over the Internet or information storage technology can be
              guaranteed to be 100% secure, so we cannot promise or guarantee
              that hackers, cybercriminals, or other unauthorized third parties
              will not be able to defeat our security, and improperly collect,
              access, steal, or modify your information. Although we will do our
              best to protect your personal information, transmission of
              personal information to and from our Website is at your own risk.
              You should only access the Website within a secure environment.
            </DialogContentText>
            <DialogContentText>
              8. WHAT ARE YOUR PRIVACY RIGHTS?
              <br />
              Cookies and similar technologies: Most Web browsers are set to
              accept cookies by default. If you prefer, you can usually choose
              to set your browser to remove cookies and to reject cookies. If
              you choose to remove cookies or reject cookies, this could affect
              certain features or services of our Website.
            </DialogContentText>
            <DialogContentText>
              9. CONTROLS FOR DO-NOT-TRACK FEATURES
              <br />
              Most web browsers and some mobile operating systems and mobile
              applications include a Do-Not-Track (“DNT”) feature or setting you
              can activate to signal your privacy preference not to have data
              about your online browsing activities monitored and collected. At
              this stage, no uniform technology standard for recognizing and
              implementing DNT signals has been finalized. As such, we do not
              currently respond to DNT browser signals or any other mechanism
              that automatically communicates your choice not to be tracked
              online. If a standard for online tracking is adopted that we must
              follow in the future, we will inform you about that practice in a
              revised version of this privacy notice.
            </DialogContentText>
            <DialogContentText>
              10. DO WE MAKE UPDATES TO THIS NOTICE?
              <br />
              We may update this privacy notice from time to time. The updated
              version will be indicated by an updated “Revised” date and the
              updated version will be effective as soon as it is accessible. If
              we make material changes to this privacy notice, we may notify you
              either by prominently posting a notice of such changes or by
              directly sending you a notification. We encourage you to review
              this privacy notice frequently to be informed of how we are
              protecting your information.
            </DialogContentText>
            <DialogContentText>
              11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
              <br />
              If you have questions or comments about this notice, you may email
              us at covid.19.au.monash@gmail.com.
            </DialogContentText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </a>
  );
}
