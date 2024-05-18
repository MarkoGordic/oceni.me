#!/bin/bash

RED='\e[01;31m'
GREEN='\e[01;32m'
BLUE='\e[01;34m'
NC='\e[00m'

TESTS=<TESTS_PLACEHOLDER>
EXITS=<EXITS_PLACEHOLDER>
EMPTY="#"
MISSING=0
QUIET=0
KEEP=0
SIG=""
OUT1=/tmp/out1

TEST01=$(cat <<EOL
pera peric
EOL
)

OUTP01=$(cat <<EOL
Unesite ime i prezime: pera peric
Vi ste: PERA PERIC
EOL
)

TEST02=$(cat <<EOL
MIKA MIKIC
EOL
)

OUTP02=$(cat <<EOL
Unesite ime i prezime: MIKA MIKIC
Vi ste: MIKA MIKIC
EOL
)

TEST03=$(cat <<EOL
pAJA pAJIC
EOL
)

OUTP03=$(cat <<EOL
Unesite ime i prezime: pAJA pAJIC
Vi ste: PAJA PAJIC
EOL
)

TEST04=$(cat <<EOL
Baja Bajic
EOL
)

OUTP04=$(cat <<EOL
Unesite ime i prezime: Baja Bajic
Vi ste: BAJA BAJIC
EOL
)

for prg in "expect" "sed" "diff" "grep"; do
    if ! which $prg &>/dev/null; then
        echo -e "${RED}Nedostaje program: $prg${NC}"
        MISSING=1
    fi
done

if [ $MISSING -ne 0 ]; then
    echo -e "\n${RED}Nedostaju vam neophodni programi za izvršavanje skripte. ${GREEN}Za instalaciju pokrenite komandu:${NC}"
    echo -e "${BLUE}sudo apt install gcc expect diffutils grep sed${NC}\n"
    exit 1
fi

function echoq {
    if [ $QUIET -eq 0 ]; then
        echo "$@"
    fi
}

if [ $# -lt 1 ]; then
    echo -e "\n${RED}GREŠKA: Morate proslediti ime fajla kao argument skripti!${NC}"
    echo -e "${GREEN}Na primer: ${BLUE}$0 ime_fajla.S${NC}\n"
    exit 1
fi

if [ "$1" == "-q" ]; then
    QUIET=1
    echo -e "\n${BLUE}Aktivan je tihi režim rada. Za više informacija pokrenite skriptu bez opcije '-q'.${NC}"
    shift
fi

if [ "$1" \> "00" ] && [ "$1" \< "99" ]; then
    TESTS=($1)
    KEEP=1
    shift
fi

if [ "$1" != "" ] && [ -f "$1" ]; then
    echoq -e "\n${BLUE}Započinjem kompajliranje...${NC}"

    grep ".text" $1 1>/dev/null 2>/dev/null && (grep ".globl" $1 1>/dev/null 2>/dev/null || grep ".global" $1 1>/dev/null 2>/dev/null)
    if [ $? -ne 0 ]; then
        echo -e "${RED}\nGREŠKA: Odabrani fajl nije asemblerski program!${NC}\n"
        exit 1
    fi
    GLAVNI=""
    if [ $(grep -c "main:" $1) == "0" ]; then
        if [ -f glavni.c ]; then
            GLAVNI=glavni.c
        else
            echoq -e "${RED}\nNije nađen glavni.c!${NC}\n"
        fi
    fi


    zfiles=$(grep -E "^[[:space:]]*#[[:space:]]*fajlovi[[:space:]]*:" $1)
    if [ "$zfiles" != "" ]; then
        zfiles=${zfiles#*:}
    else
        zfiles="$@"
    fi

    gcc -g -m32 -o zad $GLAVNI $zfiles 1>$OUT1 2>&1

    if [ $? -ne 0 ]; then
        echo -e "${RED}\nGreška u kompajliranju!${NC}\n"
        echoq -e "${BLUE}Izlaz kompajlera:\n$(cat $OUT1)${NC}"
        rm -f $OUT1
        exit 1
    fi
else
    if [ "$1" != "" ]; then
        echo -e "${RED}Fajl \"$1\" nije nađen!${NC}"
    fi
    lasttest=${TESTS[${#TESTS[@]}-1]}
    echo -e "\n${GREEN}Upotreba:${NC}"
    echo -e "${BLUE}$0 [-q] [TT] ${GREEN}ime_programa.S${NC}"
    echo -e "Opcija ${BLUE}-q${NC} aktivira tihi režim i ispisuje samo procenat uspešnih testova"
    echo -e "Opcija ${BLUE}TT${NC} (${GREEN}01<=TT<=$lasttest${NC}) pokreće samo zadati test i ispisuje diff izlaz za njega\n"
    exit 2
fi

cat >./run <<EOL
spawn -noecho [lindex \$argv 0]
for {set i 1} {\$i < [llength \$argv]} {incr i 1} {
    sleep 0.5
    send -- "[lindex \$argv \$i]"
    send "\r"
}
expect eof
catch wait reason
set sig [lindex \$reason 5]
if {\$sig == ""} {
    set code [lindex \$reason 3]
} elseif {\$sig == "SIGFPE"} {
    set code [expr 128+8]
} elseif {\$sig == "SIGSEGV"} {
    set code [expr 128+11]
} elseif {\$sig == "SIGINT"} {
    set code [expr 128+2]
} elseif {\$sig == "SIGILL"} {
    set code [expr 128+4]
} elseif {\$sig == "SIGKILL"} {
    set code [expr 128+9]
} else {
    set code [expr 128+1]
}
exit \$code
EOL

passed=0
total=0
nn=0
for n in "${TESTS[@]}"; do
    echoq -e "\n\n\e[01;34m-----------------------------------"
    echoq "TEST $n"
    echoq -e "-----------------------------------\e[00m"
    tcode=${EXITS[$nn]}
    cor="OUTP$n"
    eval cor="\$$cor"
    echo -e "$cor" > out2
    echoq -e "\e[01;32mTAČAN IZLAZ:\e[00m"

    if [ $QUIET -eq 0 ]; then
        cat out2
    fi
    
    echoq -e "\nIzlazni kod: \e[01;32m$tcode\e[00m"
    
    tst="TEST$n"
    eval tst=\$$tst
    oldIFS="$IFS"; IFS=$'\n'
    tst=($tst)
    IFS="$oldIFS"
    lin=${#tst[*]}

    for ((l=0; l<lin; l++ )); do
        if [ "${tst[$l]}" == "$EMPTY" ]; then
            eval tst[$l]=""
        fi
    done

    ok=1
    expect run ./zad "${tst[@]}" 1>$OUT1 2>&1
    code=$?
    sed -i -e '$a\' $OUT1
    sed -i 's/\x0//g' $OUT1
    sed -i 's/\xd//g' $OUT1
    sed -i 's/\x0//g' $OUT1
    for ((i=1; i<32; i++)); do
        if [ $i -ne 9 ] && [ $i -ne 10 ] && [ $i -ne 13 ]; then
            hex=$(printf '%X' $i)
            sed -i "s/\x$hex/[0x$hex]/g" $OUT1
        fi
    done

    for ((i=128; i<256; i++)); do
        hex=$(printf '%X' $i)
        sed -i "s/\x$hex/[0x$hex]/g" $OUT1
    done

    echoq -e "\e[01;34m\nVAŠ IZLAZ:\e[00m"

    if [ $QUIET -eq 0 ]; then
        cat $OUT1
    fi

    diff -q -a -w -B $OUT1 out2 1>/dev/null 2>/dev/null

    if [ $? -eq 0 ]; then
        echoq -e "${GREEN}\nIzlazi se poklapaju!\e${NC}"
    else
        echoq -e "${RED}\nIzlazi se NE poklapaju!\e${NC}"
        ok=0
    fi

    if [ $code -gt 127 ]; then
        code=$((code-128))
        sig=""
        if [ $code -eq 8 ]; then sig=" (SIGFPE - Floating point exception)"; fi
        if [ $code -eq 11 ]; then sig=" (SIGSEGV - Invalid memory segment access)"; fi
        echoq -e "\n\e[01;31mProgram je vratio Fatal error signal $code$sig!\e[00m"
        ok=0
        SIG="(zbog \e[01;31mexception\e[00m-a) "
    elif [ $code -eq $tcode ]; then
        echoq -e "\nIzlazni kod: \e[01;32m$code\e[00m"
    else
        echoq -e "\n\e[01;31mPogrešan izlazni kod: $code\e[00m"
        ok=0
    fi

    total=$((total + 1))

    if [ $ok -eq 1 ]; then
        passed=$((passed + 1))
    fi

    nn=$((nn+1))
done

percent=$((passed * 100 / total))
if [ "$SIG" != "" ]; then
    percent=0
fi

echoq -e "\n\n\e[01;34m-----------------------------------"
echoq "Ukupan rezultat"
echoq -e "-----------------------------------\e[00m"

if [ $passed -eq $total ]; then
    col="\e[01;32m"
else
    col="\e[01;31m"
fi

echo -e "Prošlo je ${col}${passed}\e[00m od \e[01;32m${total}\e[00m automatskih testova, odnosno ${SIG}${col}${percent}%.\e[00m\n"

if [ $KEEP -eq 0 ]; then
    rm -f zad run $OUT1 out2 1>/dev/null 2>/dev/null
else
    rm -f run 1>/dev/null 2>/dev/null
fi

if [ "$SIG" != "" ]; then
    exit 3
else
    exit 0
fi