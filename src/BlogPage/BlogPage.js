import React from "react";
import blogData from "../data/blogPosts";
import uuid from "uuid";
import { DiscussionEmbed } from 'disqus-react';
import './Blog.css';

import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper';

// Replace all special characters with _
function replaceAll(str, replace) {
    return str.replace(/[^A-Z0-9]+/ig, replace);
}

function BlogPage(props) {
    let blogPost = {};
    // Look through blogPosts.json to find the specific blog post.
    for (let i = 0; i < blogData.blogPosts.length; i++) {
        if (replaceAll(blogData.blogPosts[i].title, '_') === props.id) {
            blogPost = blogData.blogPosts[i];
            break;
        }
    }

    const url = 'https://covid-19-au.com/blog/post/' + props.id;

    return (
        <Grid item xs={11} sm={11} md={10}>
            {blogPost.text ? <div className="card">
                <div style={{justifyContent: 'center', display: 'flex'}}>
                    <Paper className="blogImage" variant="outlined" elevation={3}>
                        <img style={{height: '100%', width: '100%', objectFit: 'cover'}} src={blogPost.media} alt={blogPost.title} />
                    </Paper>
                </div>
                <br />
                <h2 className="responsiveH2">{blogPost.title}</h2>
                <small className="blogDateText" style={{textAlign: 'right'}}>Posted on: {blogPost.date}</small>
                <div className="blogText">
                    
                    {blogPost.text.text_1.length !== 0 ? (
                        <div className="blogSection">
                            {blogPost.text.text_1.map(t1 => (
                                <p dangerouslySetInnerHTML={{ __html: t1 }} key={uuid()} />
                            ))}
                        </div>
                    ) : ""}
                    
                    {blogPost.text.ulist_1.length !== 0 ? (
                        <div className="blogSection">
                            <ul>
                            {blogPost.text.ulist_1.map(u1 => (
                                <li dangerouslySetInnerHTML={{ __html: u1 }} key={uuid()} />
                            ))}
                            </ul>
                        </div>
                    ) : ""}

                    {blogPost.text.olist_1.length !== 0 ? (
                        <div className="blogSection">
                            <ol>
                            {blogPost.text.olist_1.map(o1 => (
                                <li dangerouslySetInnerHTML={{ __html: o1 }} key={uuid()} />
                            ))}
                            </ol>
                        </div>
                    ) : ""}
                    
                    {blogPost.text.text_2.length !== 0 ? (
                        <div className="blogSection">
                            {blogPost.text.text_2.map(t2 => (
                                <p dangerouslySetInnerHTML={{ __html: t2 }} key={uuid()} />
                            ))}
                        </div>
                    ) : ""}
                    
                </div>
                
                <DiscussionEmbed
                shortname='covid-19-au'
                config={
                    {
                        url: url,
                        identifier: blogPost.title,
                        title: blogPost.title,
                    }
                }
                />
            </div> : 
            <div className="card">
                <h3 className="responsiveH3">Sorry, this blog no longer exists.</h3>
                <small>Click <a className="citationLink" href="/blog">here</a> to return to blog page</small>
            </div>
            }
            
        </Grid>
    )
}

export default BlogPage;