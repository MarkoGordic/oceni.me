#!/bin/bash

RED='\e[01;31m'
GREEN='\e[01;32m'
BLUE='\e[01;34m'
NC='\e[00m'

TESTS=<TESTS_PLACEHOLDER>
EMPTY="#"
MISSING=0
QUIET=0
KEEP=0
SIG=""
OUT1=/tmp/out1

<TESTS_INPUTS_PLACEHOLDER>

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

if [ "$1" != "" ] && [ -f "$1" ]; then
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

    #TODO: Proveriti ovo?
    zfiles=$(find "$1" -type f -name '*.S')

    gcc -g -m32 -o zad $GLAVNI $zfiles 1>$OUT1 2>&1
    echo -e "${BLUE}Kompajliranje: ${GREEN}zad ${BLUE}glavni.c $zfiles${NC}"

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

declare -a results

for n in "${TESTS[@]}"; do
    tcode=${EXITS[$nn]}
    cor="OUTP$n"
    eval cor="\$$cor"
    echo -e "$cor" > out2
    
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
    
    out1_contents=$(cat $OUT1)

    results+=("{\"output\": \"$out1_contents\", \"code\": $code}")

    nn=$((nn+1))
done

printf -v json_results "[%s]" "$(IFS=,; echo "${results[*]}")"

echo $json_results > results.json

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