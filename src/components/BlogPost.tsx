// src/components/BlogPost.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPostsData } from '../data/blogPostsData';
import { isHeading, getHeadingText, parseMarkdown } from '../utils/markdownParser';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || '1');
  
  // Find the blog post with the matching id
  const post = blogPostsData.find(post => post.id === postId);
  
  if (!post) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h2 className="h4">Blog post not found</h2>
          <p>Sorry, the blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn btn-primary mt-3">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to render content with images for headings
  const renderContent = (content: string[]) => {
    return content.map((paragraph, index) => {
      // Check if the paragraph is a heading (starts with ##)
      if (isHeading(paragraph) && paragraph.startsWith('## ')) {
        const headingText = getHeadingText(paragraph);
        
        // Use available images alternating between document-stack.svg and signature.svg
        const imageSrc = index % 2 === 0 ? "/images/document-stack.svg" : "/images/signature.svg";
        
        return (
          <div key={index} className="mb-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="fw-bold">{headingText}</h2>
              </div>
              <div className="col-md-4">
                <div className="rounded overflow-hidden mb-3">
                  <img 
                    src={imageSrc}
                    alt={headingText} 
                    className="img-fluid" 
                    style={{ maxHeight: '150px', width: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>
        );
      } else {
        // For any other content, parse it with the markdown parser
        return (
          <div key={index} 
               className="mb-4 blog-content" 
               dangerouslySetInnerHTML={{ __html: parseMarkdown(paragraph) }}>
          </div>
        );
      }
    });
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <Link to="/blog" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Blog
          </Link>
        </div>
        
        <article className="blog-post">
          <h1 className="display-5 fw-bold mb-4">{post.title}</h1>
          
          <div className="d-flex align-items-center mb-4">
            <div className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
              <i className="bi bi-person"></i>
            </div>
            <div>
              <div className="fw-medium">{post.author}</div>
              <div className="text-muted small">{post.date}</div>
            </div>
          </div>
          
          {/* Use a consistent featured image */}
          <div className="rounded overflow-hidden mb-4">
            <img 
              src={post.id % 2 === 0 ? "/images/document-stack.svg" : "/images/signature.svg"} 
              alt={post.title} 
              className="img-fluid w-100 p-4 bg-light" 
              style={{ maxHeight: '400px', objectFit: 'contain' }} 
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="blog-content"
          >
            {renderContent(post.content)}
          </motion.div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-5 pt-4 border-top">
              <div className="d-flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="badge bg-light text-dark px-3 py-2 rounded-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-5 pt-4 border-top">
            <h4 className="h5 mb-4">Related Articles</h4>
            <div className="row g-4">
              {blogPostsData
                .filter(relatedPost => relatedPost.id !== post.id)
                .slice(0, 2)
                .map(relatedPost => (
                  <div key={relatedPost.id} className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <div className="mb-3 text-secondary small">{relatedPost.date}</div>
                        <h3 className="h5 card-title fw-bold mb-2">{relatedPost.title}</h3>
                        <p className="card-text text-muted">{relatedPost.excerpt}</p>
                        <Link to={`/blog/post/${relatedPost.id}`} className="btn btn-link p-0 text-decoration-none">
                          Read more <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </article>
      </motion.div>
    </div>
  );
};

export default BlogPost;