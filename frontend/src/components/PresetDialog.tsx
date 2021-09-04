import React, {FunctionComponent, useEffect, useState} from "react";
import {Role} from "../Message";
import { styled } from '@material-ui/core/styles';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip} from "@material-ui/core";



interface Preset {
    name: string
    roles: Array<Role>
}

const presets: Array<Preset> = [
    {
        name: "Empty", roles: []
    },
    {
        name: "Secret Hitler", roles: [
            {name: "Hitler", quantity: 1, team: "Evil"},
            {name: "Facist", quantity: 2, team: "Evil"},
            {name: "Liberal", quantity: 4, team: "Good"}
        ]
    },
    {
        name: "Avalon", roles: [
            {name: "Assassin", quantity: 1, team: "Evil"},
            {name: "Morgana", quantity: 1, team: "Evil"},
            {name: "Mordred", quantity: 1, team: "Evil"},
            {name: "Merlin", quantity: 1, team: "Good"},
            {name: "Percival", quantity: 1, team: "Good"},
            {name: "Servant of Arthur", quantity: 2, team: "Good"}
        ]
    },
    {
        name: "Mafia", roles: [
            {name: "Mafia", quantity: 3, team: "Evil"},
            {name: "Detective", quantity: 1, team: "Good"},
            {name: "Medic", quantity: 1, team: "Good"},
            {name: "Townsperson", quantity: 10, team: "Good"}
        ]
    },
    {
        name: "Code Names", roles: [
            {name: "Red Code Master", quantity: 1, team: "Red"},
            {name: "Blue Code Master", quantity: 1, team: "Blue"},
            {name: "Red Team Member", quantity: 2, team: "Red"},
            {name: "Blue Team Memeber", quantity: 2, team: "Blue"}
        ]
    },
    {
        name: "Two Team (General)", roles: [
            {name: "Players of Team 1", quantity: 5, team: "Team 1"},
            {name: "Players of Team 2", quantity: 5, team: "Team 2"},
        ]
    }
]

const StyledChip = styled(Chip)({
    margin: '0.15rem',
});


export const PresetDialog: FunctionComponent<{ visible: boolean, onSelect: (preset: Preset | null) => any }> = props => {
    const [chosenPreset, setChosenPreset] = useState<Preset | null>(null)

    // Reset the UI on close
    useEffect(() => {
            if (!props.visible)
                setChosenPreset(null)
        }, [props.visible])

    return <Dialog open={props.visible} onClose={() => props.onSelect(null)}>
        <DialogTitle>Choose a role preset</DialogTitle>
        <DialogContent>
            {presets.map(preset =>
                <StyledChip key={preset.name} label={preset.name} color={chosenPreset === preset ? "primary" : "default"}
                      onClick={() => setChosenPreset(preset)}/>)}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onSelect(null)} color="primary" autoFocus>Cancel</Button>
            <Button onClick={() => props.onSelect(chosenPreset)} color="primary" autoFocus>Select</Button>
        </DialogActions>
    </Dialog>
}