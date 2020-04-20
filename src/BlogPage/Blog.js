import React, { useState, Component } from "react";
import blogData from "../data/blogPosts";
import uuid from "react-uuid";
import "./Blog.css";
import {A} from "hookrouter";
import BlogPagination from "./BlogPagination";

// Styling imports
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

class AWrapper extends Component {
    render() {
        return (
            <A {...this.props}/>
        )
    }
}

// Replace all special characters with _
function replaceAll(str, replace) {
    return str.replace(/[^A-Z0-9]+/ig, replace);
}

const filterPickList = [
    {label: 'All', value: "All"},
    {label: 'Informative', value: 'Informative'},
    {label: 'Fun', value: 'Fun'},
    {label: 'Feature', value: 'Feature'},
    {label: 'Lifestyle', value: 'Lifestyle'},
    {label: 'Other', value: 'Other'}
];

const Blog = (props) => {
    const [posts, setPosts] = useState(blogData.blogPosts);
    const [filter, setFilter] = useState('All');
    const postsPerPage = 1;

    const onChange = e => {
        setFilter(e.target.value);
        console.log(e);
        setPosts(filterBlogs(blogData.blogPosts, e.target.value));
        console.log(posts);
    }

    const onClick = () => {
        window.scrollTo(0, 0);
    }

    const filterBlogs = (allBlogs, tag) => {
        return allBlogs.filter(blog => {
            if (tag === "All") {
                return blog;
            } else if (blog.tag === tag) {
                return blog;
            }
            return false;
        });
    }
    const pageNum = Object.keys(props).length === 0 && props.constructor === Object ? 1 : props.id;
    const indexOfLastPost = pageNum * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    return (
        <Grid item xs={11} sm={11} md={10}>
            <div className="card">
                <h2 className="responsiveH2">Blog</h2>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <Grid container className="filterDropDown filterBox">
                        <Grid item xs={10} sm={8} md={6} lg={4} xl={2} className="filterDropDown">
                            <form noValidate autoComplete="off">
                                <TextField
                                    id="standard-select-currency"
                                    select
                                    label="Filter a Genre"
                                    value={filter}
                                    onChange={onChange}
                                    variant="outlined"
                                    className="filterText">
                                >
                                    {filterPickList.map((option) => (
                                        <AWrapper href="/blog" key={uuid()} value={option.value} >
                                            <MenuItem value={option.value} className="filterText">
                                                {option.label}
                                            </MenuItem>
                                        </AWrapper>
                                    ))}
                                </TextField>
                            </form>
                        </Grid>
                    </Grid>
                </div>
                <Grid container direction="row" justify="center" alignItems="center">
                    {currentPosts.map(blog => (
                        <Card key={uuid()} className="classesRoot cardFormat">
                            <A onClick={onClick} className="noHover" href={`/blog/post/${replaceAll(blog.title, '_')}`}>
                                <CardActionArea>
                                    <Grid container direction="row" justify="center" >
                                        <Grid className="responsiveCardTop" item xs={12} sm={12} md={6}>
                                            <CardContent style={{paddingBottom: 0, height: '100%'}}>
                                                <div style={{height: "80%", marginBottom: 'auto'}}>
                                                    <Typography gutterBottom className="classesH2" variant="h5" component="h2">
                                                    {blog.title}
                                                    </Typography>
                                                    <Typography gutterBottom variant="body2" color="textSecondary" component="p">
                                                    {blog.summary}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography gutterBottom variant="overline" color="textSecondary" component="p">
                                                    {blog.date}
                                                    </Typography>
                                                </div>
                                            </CardContent>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={6}>
                                            <CardMedia
                                                component="img"
                                                alt="Beautiful View"
                                                className="blogThumbnail"
                                                image={blog.media}
                                                title="Beautiful View"
                                            />
                                        </Grid>
                                        <Grid className="responsiveCardBottom" item xs={12} sm={12} md={6}>
                                            <CardContent style={{paddingBottom: 0}}>
                                                <div style={{height: "80%", marginBottom: 'auto'}}>
                                                    <Typography gutterBottom className="classesH2" variant="h5" component="h2">
                                                    {blog.title}
                                                    </Typography>
                                                    <Typography gutterBottom variant="body2" color="textSecondary" component="p">
                                                    {blog.summary}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography style={{textAlign: 'right'}} gutterBottom variant="overline" color="textSecondary" component="p">
                                                    {blog.date}
                                                    </Typography>
                                                </div>
                                            </CardContent>
                                        </Grid>
                                    </Grid>
                                </CardActionArea>
                            </A>
                        </Card>
                    ))}
                </Grid>
                <BlogPagination totalPosts={posts.length} postsPerPage={postsPerPage} page={props.id}/>
            </div>
        </Grid>
    )    
}

export default Blog;