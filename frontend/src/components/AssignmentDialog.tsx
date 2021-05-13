import React, {FunctionComponent} from "react";
import {RoleAssignment} from "../Message";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";

export function getRoleAssignmentMessage(assignment: RoleAssignment | null) {
    if (assignment === null) {
        return "A role assigment occurred."
    }
    const role = assignment?.role ?? '""'
    return `${assignment?.requested_by} requested a role assignment. Your assigned role is ${role} ${assignment?.team ? ` and your team is ${assignment.team}.` : "."}`
}

export const AssignmentDialog: FunctionComponent<{assignment: RoleAssignment | null, onClose: ()=>any}> = props => {
    const role = props.assignment?.role ?? '""'
    return <Dialog open={props.assignment != null} onClose={props.onClose}>
        <DialogTitle>Your role is {role}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {getRoleAssignmentMessage(props.assignment)}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose} color="primary" autoFocus>Close</Button>
        </DialogActions>
    </Dialog>
}