// src/components/Blog.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPostsData } from '../data/blogPostsData';

const Blog: React.FC = () => {
  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="display-4 fw-bold mb-5">Blog</h1>
        
        <div className="row g-4">
          {blogPostsData.map((post, index) => (
            <div className="col-md-6 col-lg-4" key={post.id}>
              <motion.div 
                className="card h-100 border-0 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-img-top overflow-hidden" style={{ maxHeight: '180px' }}>
                  <img 
                    src={index % 2 === 0 ? "/images/document-stack.svg" : "/images/signature.svg"} 
                    alt={post.title} 
                    className="img-fluid w-100 p-3"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-body p-4">
                  <div className="mb-3 text-secondary small">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>By {post.author}</span>
                  </div>
                  <h2 className="card-title h4 fw-bold mb-2">{post.title}</h2>
                  <p className="card-text text-muted mb-3">{post.excerpt}</p>
                  <Link 
                    to={`/blog/post/${post.id}`} 
                    className="btn btn-link p-0 text-decoration-none"
                  >
                    Read more <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-5">
          <h3 className="h5 fw-bold mb-4">Subscribe to our newsletter</h3>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group mb-3">
                <input type="email" className="form-control" placeholder="Enter your email address" />
                <button className="btn btn-primary" type="button">Subscribe</button>
              </div>
              <p className="text-muted small">Get the latest articles and resources sent to your inbox</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Blog;