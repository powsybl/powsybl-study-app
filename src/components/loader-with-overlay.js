import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        zIndex: 99,
        fontSize: 15,
    },
}));

const LoaderWithOverlay = ({
    color,
    loaderSize,
    loadingMessageText,
    loadingMessageSize,
}) => {
    const classes = useStyles();

    return (
        <div className={classes.overlay} id={color}>
            <CircularProgress color={color} size={loaderSize} />
            <FormattedMessage id={loadingMessageText} />
        </div>
    );
};

export default LoaderWithOverlay;
