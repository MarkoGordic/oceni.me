import React from "react";
import './realtimeInterpreterTab.css';

const describeInstruction = (instruction) => {
    const parts = instruction.trim().split(/\s+/);
    const cmd = parts[0];
    const fullInstruction = instruction.trim();
    let args = fullInstruction.replace(cmd, '').trim().split(',').map(arg => {
        arg = arg.trim();
        if (arg[arg.length - 1] === '(') {
            arg = arg.slice(0, -1).trim();
        }
        return arg;
    });
    
    const labelMatch = fullInstruction.match(/<([^>]+)>/);
    let label = labelMatch ? labelMatch[1] : null;
    if (label) {
        label = label.split('+')[0];
    }

    let description;
    
    const styledArgs = args.map(arg => `<span style="color: #1993F0;">${arg}</span>`);

    switch (cmd) {
        case 'movl':
        case 'mov':
            return `Pomeramo vrednost ${styledArgs[0]} u <span style="color: #2ba92b;"><strong>${styledArgs[1]}</strong></span>`;
        case 'movb':
            return `Pomeramo bajt ${styledArgs[0]} u <span style="color: #2ba92b;"><strong>${styledArgs[1]}</strong></span>`;
        case 'cmpl':
        case 'cmp':
            return `Upoređujemo vrednosti ${styledArgs[0]} i ${styledArgs[1]}`;
        case 'add':
            return `Sabiramo ${styledArgs.join(' + ')}`;
        case 'sub':
            return `Oduzimamo ${styledArgs.join(' - ')}`;
        case 'mul':
            return `Množimo ${styledArgs.join(' * ')}`;
        case 'div':
            return `Delimo ${styledArgs.join(' / ')}`;
        case 'inc':
        case 'incl':
            return `Inkrementiramo vrednost registra ${styledArgs[0]}`;
        case 'dec':
        case 'decl':
            return `Dekrementiramo vrednost registra ${styledArgs[0]}`;
        case 'jmp':
        case 'je':
        case 'jne':
        case 'ja':
        case 'jae':
        case 'jb':
        case 'jbe':
        case 'jg':
        case 'jge':
        case 'jl':
        case 'jle':
            const condition = {
                'jmp': 'bezuslovni skok na',
                'je': 'skok ako je jednako na ',
                'jne': 'skok ako nije jednako na ',
                'ja': 'skok ako je veće na ',
                'jae': 'skok ako je veće ili jednako na ',
                'jb': 'skok ako je manje na ',
                'jbe': 'skok ako je manje ili jednako na ',
                'jg': 'skok ako je veće (potpisano) na ',
                'jge': 'skok ako je veće ili jednako (potpisano) na ',
                'jl': 'skok ako je manje (potpisano) na ',
                'jle': 'skok ako je manje ili jednako (potpisano) na '
            }[cmd] || 'skok na';
            description = `${condition} adresu ${styledArgs[0]}`;
            if (label) {
                description += ` (<strong>${label}</strong>)`;
            }
            return description;
        case 'int':
            return `Poziv prekida sa vektorskim brojem ${styledArgs[0]}`;
        case 'leal':
        case 'lea':
            return `Učitavamo efektivnu adresu ${styledArgs.join(' u ')}`;
        case 'push':
            return `Stavljamo ${styledArgs[0]} na stek`;
        case 'pop':
            return `Skidamo ${styledArgs[0]} sa steka`;
        case 'call':
            return `Pozivamo funkciju na adresi ${styledArgs[0]}`;
        case 'ret':
            return `Vraćamo se iz funkcije`;
        case 'nop':
            return `Nema operacije (NOP)`;
        case 'syscall':
            return `Izvršavamo sistemski poziv`;
        default:
            return `Nepoznata instrukcija ${styledArgs.join(', ')}`;
    }
};

const RealtimeInterpreterTab = ({ currentDebbugLine }) => {
    if (!currentDebbugLine) {
        return (
            <div className="interpreter-tab">
                Pokrenite debugger kako biste videli opis instrukcije.
            </div>
        );
    }

    const description = describeInstruction(currentDebbugLine.split('\t')[1]);
    
    return (
        <div className="interpreter-tab" dangerouslySetInnerHTML={{ __html: description }} />
    );
};

export default RealtimeInterpreterTab;
