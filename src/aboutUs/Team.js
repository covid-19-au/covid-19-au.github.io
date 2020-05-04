import React, { lazy, Suspense } from 'react';
import uuid from 'uuid';
import Grid from '@material-ui/core/Grid';

const Member = lazy(() => import('./Member'))

const Team = (props) => {
    const { teamName, members } = props.team;
    return (
        <div style={{marginBottom: '1.5rem'}}>
            <h1 className="aboutUsHeadings">{teamName}</h1>
            <Grid container spacing={1}>
                {members.length > 0 
                ? members.map(member => 
                    <Suspense key={uuid()}>
                        <Member member={member} />
                    </Suspense>
                ) 
                : ''}
            </Grid>
        </div>
        
    )
}

export default Team;