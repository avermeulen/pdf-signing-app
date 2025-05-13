import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onUploadClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUploadClick }) => {
  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-lg-6">
          <div className="d-flex flex-column justify-content-center h-100 p-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="display-3 fw-bold mb-3">Sign documents with ease</h1>
              <p className="lead text-muted mb-4">
                Upload, sign, and download your PDFs in seconds. No account required.
              </p>
              <div className="d-flex gap-3">
                <motion.button
                  className="btn btn-primary btn-lg px-4 py-3 shadow"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUploadClick}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Upload PDF
                </motion.button>
                <motion.a
                  href="#features"
                  className="btn btn-outline-dark btn-lg px-4 py-3"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="col-lg-6 d-none d-lg-block">
          <motion.div 
            className="h-100 position-relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="position-absolute top-0 end-0 w-100 h-100 bg-gradient-primary rounded-start-5 d-flex align-items-center justify-content-center">
              <div className="position-relative" style={{ width: "80%", maxWidth: "500px" }}>
                <motion.img
                  src="/images/document-stack.svg"
                  alt="PDF document stack"
                  className="img-fluid shadow-lg rounded-4"
                  style={{ width: "100%" }}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 2 
                  }}
                />
                <motion.div 
                  className="position-absolute"
                  style={{ 
                    top: "30%", 
                    right: "-10%",
                    width: "40%"
                  }}
                  initial={{ rotate: -15 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    delay: 0.5,
                    duration: 0.8, 
                    ease: "easeOut"
                  }}
                >
                  <img 
                    src="/images/signature.svg" 
                    alt="Signature" 
                    className="img-fluid" 
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div id="features" className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-5"
        >
          <h2 className="display-5 fw-bold">How it works</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
            Our PDF signing tool is simple, secure, and doesn't require account creation
          </p>
        </motion.div>
        
        <div className="row g-4 mb-5">
          {[
            {
              icon: "bi-file-earmark-arrow-up",
              title: "Upload",
              description: "Upload your PDF document from your computer"
            },
            {
              icon: "bi-pen",
              title: "Sign",
              description: "Add your signature or initials anywhere in the document"
            },
            {
              icon: "bi-file-earmark-arrow-down",
              title: "Download",
              description: "Save your signed PDF to your device"
            }
          ].map((feature, index) => (
            <div className="col-md-4" key={index}>
              <motion.div 
                className="card h-100 border-0 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="card-body p-4 text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i className={`${feature.icon} fs-3 text-primary`}></i>
                  </div>
                  <h3 className="card-title h5 fw-bold">{feature.title}</h3>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;