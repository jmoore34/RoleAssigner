import React, {FunctionComponent} from "react";
import {Role} from "../Message";
import {Cell, Grid} from "styled-css-grid";
import {Button, IconButton, TextField} from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';

interface RoleViewProps {
    role: Role,
    onChange: (role: Role | null) => any
}
export const RoleView: FunctionComponent<RoleViewProps> = props => {
    return <>
        <Grid
            columns="1fr 1fr 4ch auto"
        >
            <Cell>
                <TextField label="Role Name" fullWidth value={props.role.name} onChange={e =>
                    props.onChange({...props.role, name: e.target.value as string})
                }/>
            </Cell>
            <Cell>
                <TextField label="Role Team" fullWidth value={props.role.team} onChange={e =>
                    props.onChange({...props.role, team: e.target.value as string})
                }/>
            </Cell>
            <Cell>
                <TextField label="Quantity" type="number" fullWidth value={props.role.quantity} onChange={e =>
                    props.onChange({...props.role, quantity: parseInt(e.target.value)})
                }/>
            </Cell>
            <Cell>
                <IconButton onClick={() => {
                    props.onChange(null) // delete
                }}>
                    <DeleteIcon />
                </IconButton>
            </Cell>
        </Grid>
    </>
}