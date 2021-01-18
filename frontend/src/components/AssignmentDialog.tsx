import React, {FunctionComponent} from "react";
import {RoleAssignment} from "../Message";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";

export const AssignmentDialog: FunctionComponent<{assignment: RoleAssignment | null, onClose: ()=>any}> = props => {
    const role = props.assignment?.role ?? '""'
    return <Dialog open={props.assignment != null} onClose={props.onClose}>
        <DialogTitle>Your role is {role}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {props.assignment?.requested_by} requested a role assignment. Your assigned role is {role}
                {props.assignment?.team ? ` and your team is ${props.assignment.team}.` : "."}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose} color="primary" autoFocus>Close</Button>
        </DialogActions>
    </Dialog>
}