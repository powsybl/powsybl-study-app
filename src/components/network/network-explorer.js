/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { useIntl } from 'react-intl';

import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import { darken, lighten, makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import Network from './network';
import Divider from '@material-ui/core/Divider';
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
} from 'react-virtualized';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';

const itemSize = 48;

const useStyles = makeStyles((theme) => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 16px)', // to fix an issue with fullWidth of textfield
    },
    listSubHeaderRoot: {
        backgroundColor: darken(theme.palette.background.default, 0.2),
        textAlign: 'left',
        height: (itemSize * 3) / 4,
        justifyContent: 'space-between',
        '&:hover': {
            backgroundColor: lighten(theme.palette.background.paper, 0.1),
        },
    },
    listItem: {
        backgroundColor: theme.palette.background.default,
        '&:hover': {
            backgroundColor: darken(theme.palette.background.paper, 0.1),
        },
        textIndent: theme.spacing(2),
    },
    substationText: {
        marginLeft: -theme.spacing(1),
    },
    countryText: {
        marginLeft: theme.spacing(1),
    },
    noCRGrid: {
        flexFlow: 'row',
    },
}));

const NetworkExplorer = ({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
}) => {
    const intl = useIntl();

    const useName = useSelector((state) => state.useName);

    const filterMsg = intl.formatMessage({ id: 'filter' }) + '...';

    const classes = useStyles();

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState(
        []
    );

    const identifiedElementComparator = useCallback(
        (vl1, vl2) => {
            return useName
                ? vl1.name.localeCompare(vl2.name)
                : vl1.id.localeCompare(vl2.id);
        },
        [useName]
    );

    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: itemSize,
    });

    const generateFilteredSubstation = useCallback(
        (entry) => {
            const subs = [];
            const match = (item) => {
                const lc = useName
                    ? item.name.toLowerCase()
                    : item.id.toLowerCase();
                return lc.includes(entry);
            };

            network.getSubstations().forEach((item) => {
                let subVoltagesLevel = entry
                    ? item.voltageLevels.filter(match)
                    : item.voltageLevels;
                if (
                    entry === undefined ||
                    entry === '' ||
                    subVoltagesLevel.length > 0 ||
                    match(item)
                ) {
                    subs.push([
                        item,
                        subVoltagesLevel.sort(identifiedElementComparator),
                    ]);
                }
            });
            subs.sort((a, b) => identifiedElementComparator(a[0], b[0]));
            setFilteredVoltageLevels(subs);
        },
        [identifiedElementComparator, network, useName]
    );

    useEffect(() => {
        if (network) {
            generateFilteredSubstation();
        }
    }, [network, identifiedElementComparator, generateFilteredSubstation]);

    function onDisplayClickHandler(vl) {
        if (onVoltageLevelDisplayClick !== null) {
            onVoltageLevelDisplayClick(vl.id);
        }
    }

    function onDisplaySubstationFocusHandler(substation) {
        if (onSubstationFocus !== null) {
            onSubstationFocus(substation.id);
        }
    }

    const voltagelevelInfo = (vl) => {
        return vl.nominalVoltage + ' kV';
    };

    const substationInfo = (substation) => {
        if (substation.countryName) return ' — ' + substation.countryName;
        return '';
    };

    const voltageLevelRow = (vl) => (
        <ListItem button key={vl.id} className={classes.listItem}>
            <ListItemText
                primary={
                    <Typography color="textPrimary" noWrap>
                        {useName ? vl.name : vl.id}
                    </Typography>
                }
                secondary={
                    <Typography
                        style={{ fontSize: 'small' }}
                        color="textSecondary"
                        noWrap
                    >
                        {voltagelevelInfo(vl)}
                    </Typography>
                }
                onClick={() => onDisplayClickHandler(vl)}
            />
        </ListItem>
    );

    const subStationRow = ({ index, key, parent, style }) => {
        const substation = filteredVoltageLevels[index][0];
        return (
            <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
            >
                {({ measure, registerChild }) => (
                    <div ref={registerChild} style={style}>
                        <ListItem
                            component={'li'}
                            button
                            key={substation.id}
                            className={classes.listSubHeaderRoot}
                        >
                            <Grid
                                container
                                onClick={() =>
                                    onSubstationDisplayClick &&
                                    onSubstationDisplayClick(substation.id)
                                }
                                direction={'row'}
                                className={classes.noCRGrid}
                            >
                                <Grid item>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                color="textPrimary"
                                                className={
                                                    classes.substationText
                                                }
                                                noWrap
                                            >
                                                {useName
                                                    ? substation.name
                                                    : substation.id}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                                <Grid item>
                                    <ListItemText
                                        className={classes.countryText}
                                        primary={
                                            <Typography
                                                style={{ overflow: 'hidden' }}
                                                color="textSecondary"
                                                noWrap
                                            >
                                                {substationInfo(substation)}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            </Grid>
                            <IconButton
                                onClick={() =>
                                    onDisplaySubstationFocusHandler(substation)
                                }
                            >
                                <GpsFixedIcon />
                            </IconButton>
                        </ListItem>
                        {filteredVoltageLevels[index][1].map((vl) =>
                            voltageLevelRow(vl)
                        )}

                        <Grid onLoad={measure} />
                    </div>
                )}
            </CellMeasurer>
        );
    };

    const filter = (event) => {
        generateFilteredSubstation(event.target.value.toLowerCase());
    };

    return (
        <AutoSizer>
            {({ width, height }) => {
                return (
                    <div style={{ width: width, height: height }}>
                        <Grid container direction="column">
                            <Grid item>
                                <TextField
                                    className={classes.textField}
                                    size="small"
                                    placeholder={filterMsg}
                                    onChange={filter}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Divider />
                            <Grid item>
                                <List
                                    height={height - 46}
                                    rowHeight={cache.rowHeight}
                                    rowRenderer={subStationRow}
                                    rowCount={filteredVoltageLevels.length}
                                    width={width}
                                    subheader={<li />}
                                />
                            </Grid>
                        </Grid>
                    </div>
                );
            }}
        </AutoSizer>
    );
};

NetworkExplorer.defaultProps = {
    network: null,
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network),
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
};

export default React.memo(NetworkExplorer);
