import React, {Component} from 'react';
import {A} from 'hookrouter';
import Pagination from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';

class AWrapper extends Component {
    render() {
        return (
            <A {...this.props}/>
        )
    }
}

const BlogPagination = ({ postsPerPage, totalPosts, page }) => {
    if (isNaN(parseInt(page))) {
        page = 1;
    }
    return (
        <Pagination
            page={parseInt(page)}
            count={Math.ceil(totalPosts / postsPerPage)}
            renderItem={(item) => (
                <PaginationItem
                    component={AWrapper}
                    href={item.page === 1 ? '/blog' : `/blog/${item.page}`}
                    {...item}
                />
            )}
        />
    )
}

export default BlogPagination;