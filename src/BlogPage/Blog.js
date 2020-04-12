import React, {Component} from "react";
import blogData from "../data/blogPosts";
import uuid from "react-uuid";
import "./Blog.css";
import {A} from "hookrouter";

// Styling imports
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

const filterOptions = createFilterOptions({
    matchFrom: 'start',
    stringify: (option) => option.title,
});

// Replace all special characters with _
function replaceAll(str, replace) {
    return str.replace(/[^A-Z0-9]+/ig, replace);
}

const filterPickList = [
    {title: 'Informative'},
    {title: 'Fun'},
    {title: 'Feature'},
    {title: 'Lifestyle'},
    {title: 'Other'}
];

class Blog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentFilter: ''
        }
    }

    onChange = e => {
        this.setState({currentFilter: e.target.innerHTML});
    }

    onClick = () => {
        window.scrollTo(0, 0);
    }

    filterBlogs = (allBlogs, tag) => {
        let opts = filterPickList.map(picks => picks.title);
        return allBlogs.filter(blog => {
            if (!opts.includes(tag)) {
                return blog;
            } else if (blog.tag === tag) {
                return blog;
            }
        });
    }

    render() {
        return(
            <Grid item xs={11} sm={11} md={10}>
                <div className="card">
                    <h2 className="responsiveH2">Blog</h2>
                    <Grid container direction="row" justify="center" alignItems="center" style={{marginBottom: '2em'}}>
                        <Grid item style={{display: 'flex', justifyContent: 'center'}} xs={10} sm={8} md={6} lg={4} xl={2}>
                            <Autocomplete
                                openOnFocus
                                id="filter-demo"
                                options={filterPickList}
                                getOptionLabel={(option) => option.title}
                                filterOptions={filterOptions}
                                onChange={this.onChange}
                                style={{ width: 220 }}
                                renderInput={(params) => <TextField {...params} label="Filter a Genre" variant="outlined" />}
                            />
                        </Grid>
                    </Grid>
                    <Grid container direction="row" justify="center" alignItems="center">
                        {this.filterBlogs(blogData.blogPosts, this.state.currentFilter).map(blog => (
                            <Card key={uuid()} className="classesRoot cardFormat">
                                <A onClick={this.onClick} className="noHover" href={`/blog/${replaceAll(blog.title, '_')}`}>
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
                </div>
            </Grid>
        )
    }
    
}

export default Blog;